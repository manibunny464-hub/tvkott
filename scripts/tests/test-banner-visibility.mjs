import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectVisibleBanners } from '../../src/lib/bannerVisibility.mjs';

const now = new Date('2026-11-05T10:00:00Z');
function fixture() {
  return {
    banners: [{ _id: 'banner', linkedContentId: 'content', linkedContentType: 'movie',
      title: 'Test', imageUrl: '/banner.jpg', order: 1, isActive: true }],
    contents: [{ _id: 'content', type: 'series', language: ['Telugu'], isActive: true }],
    seasons: [{ _id: 'season', seriesId: 'content', isActive: true }],
    episodes: [{ _id: 'episode', seriesId: 'content', seasonId: 'season',
      status: 'Published', isActive: true, languages: [{ language: 'Telugu' }] }],
  };
}
const visible = (data, languages = ['Telugu']) => selectVisibleBanners(data, languages, now);

test('valid linked series uses actual content type and retains client content IDs', () => {
  const [banner] = visible(fixture());
  assert.equal(banner.contentId, 'content');
  assert.equal(banner._id, 'content');
  assert.equal(banner.type, 'series');
  assert.equal(banner.linkedContentType, 'series');
});
test('no language preference or wrong language returns no banners', () => {
  for (const languages of [[], [''], ['Hindi']]) assert.deepEqual(visible(fixture(), languages), []);
});
test('language names ignore surrounding spaces and case, with any selected language matching', () => {
  assert.equal(visible(fixture(), ['Hindi', ' telugu ']).length, 1);
});
for (const collection of ['banners', 'contents', 'seasons', 'episodes']) {
  for (const patch of [{ isActive: false }, { isDeleted: true }]) {
    test(`${collection} ${JSON.stringify(patch)} cannot leak into banners`, () => {
      const data = fixture();
      Object.assign(data[collection][0], patch);
      assert.deepEqual(visible(data), []);
    });
  }
}
test('unlinked, missing-content and empty-image banners stay hidden', () => {
  for (const patch of [{ linkedContentId: null }, { linkedContentId: 'missing' }, { imageUrl: ' ' }]) {
    const data = fixture();
    Object.assign(data.banners[0], patch);
    assert.deepEqual(visible(data), []);
  }
});
test('no fallback resurrects disabled or absent banners from featured content', () => {
  const data = fixture();
  data.contents[0].isFeatured = true;
  data.banners = [];
  assert.deepEqual(visible(data), []);
});
test('content with no language cannot match; legacy languages field remains supported', () => {
  const data = fixture();
  data.contents[0].language = [];
  assert.deepEqual(visible(data), []);
  data.contents[0].languages = ['Telugu'];
  assert.equal(visible(data).length, 1);
  data.contents[0].language = ['Hindi'];
  assert.deepEqual(visible(data), []);
});
test('only released content is eligible', () => {
  for (const patch of [
    { isComingSoon: true },
    { isComingSoon: true, expectedReleaseDate: '2027-01-01' },
    { scheduledPublishAt: '2027-01-01' },
    { scheduledPublishAt: 'invalid' },
  ]) {
    const data = fixture();
    Object.assign(data.contents[0], patch);
    assert.deepEqual(visible(data), []);
  }
  const data = fixture();
  Object.assign(data.contents[0], { isComingSoon: true, expectedReleaseDate: '2026-01-01' });
  assert.equal(visible(data).length, 1);
});
test('series needs a published episode in its actual active season and selected language', () => {
  for (const patch of [
    { status: 'Draft' }, { status: 'Inactive' }, { status: 'Scheduled' },
    { seasonId: 'missing' }, { seriesId: 'different' },
    { releaseDate: '2027-01-01' }, { airDate: '2027-01-01' },
    { languages: [] }, { languages: [{ language: 'Hindi' }] },
  ]) {
    const data = fixture();
    Object.assign(data.episodes[0], patch);
    assert.deepEqual(visible(data), []);
  }
  const data = fixture();
  data.seasons[0].seriesId = 'different';
  assert.deepEqual(visible(data), []);
});
test('series with no seasons or episodes are hidden', () => {
  for (const collection of ['seasons', 'episodes']) {
    const data = fixture();
    data[collection] = [];
    assert.deepEqual(visible(data), []);
  }
});
test('movies and shorts require language and active content but no episodes', () => {
  for (const type of ['movie', 'short']) {
    const data = fixture();
    data.contents[0].type = type;
    data.episodes = [];
    data.seasons = [];
    assert.equal(visible(data).length, 1);
  }
});
test('filter before limiting: ten ineligible top banners cannot hide valid lower banners', () => {
  const data = fixture();
  data.banners.unshift(...Array.from({ length: 12 }, (_, index) => ({
    ...data.banners[0], _id: `bad-${index}`, linkedContentId: 'missing', order: 100,
  })));
  assert.equal(visible(data).length, 1);
});
test('display limit is ten and preserves descending priority and recency', () => {
  const data = fixture();
  data.banners = Array.from({ length: 12 }, (_, index) => ({
    ...data.banners[0], _id: `banner-${index}`, title: `Banner ${index}`,
    createdAt: new Date(now.getTime() + index),
  }));
  const result = visible(data);
  assert.equal(result.length, 10);
  assert.equal(result[0].title, 'Banner 11');
});
