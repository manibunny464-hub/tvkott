"use client";

/* eslint-disable @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, jsx-a11y/alt-text */

import React, { useState, useEffect } from "react";
import {
  Loader2,
  GripVertical,
  Pencil,
  Trash2,
  Bell,
  Shield,
  TrendingUp,
  Clock,
  Calendar,
  MoveUp,
  MoveDown,
  Trophy,
} from "lucide-react";

export default function FeaturedContentView({ notify, refreshCounter }) {
  const [activeSection, setActiveSection] = useState("bb");
  const [data, setData] = useState({ bb: [], tr: [], cs: [] });
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState({ section: null, id: null });
  const [editForm, setEditForm] = useState({});
  const [dragSrc, setDragSrc] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resBb, resTr, resCs] = await Promise.all([
        fetch("/api/admin/blockbusters?limit=50"),
        fetch("/api/admin/trending?limit=50"),
        fetch("/api/admin/coming-soon?limit=50"),
      ]);
      const [bb, tr, cs] = await Promise.all([
        resBb.json(),
        resTr.json(),
        resCs.json(),
      ]);

      setData({
        bb: bb.blockbusters || bb.blockbusterItems || [],
        tr: tr.trending || tr.trendingItems || [],
        cs: cs.comingSoon || cs.comingSoonItems || [],
      });
    } catch (err) {
      console.error(err);
      notify("Failed to load featured content", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [refreshCounter]);

  const getSectionData = (sec) => data[sec] || [];

  const handleDragStart = (e, sec, idx) => {
    setDragSrc({ sec, idx });
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      e.target.classList.add("opacity-40", "cursor-grabbing");
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("opacity-40", "cursor-grabbing");
    document
      .querySelectorAll(".drag-over")
      .forEach((el) =>
        el.classList.remove(
          "drag-over",
          "border-dashed",
          "border-2",
          "border-[var(--admin-primary)]",
        ),
      );
  };

  const handleDragOver = (e, sec) => {
    e.preventDefault();
    if (!dragSrc || dragSrc.sec !== sec) return;
    const card = e.currentTarget;
    document
      .querySelectorAll(".drag-over")
      .forEach((el) =>
        el.classList.remove(
          "drag-over",
          "border-dashed",
          "border-2",
          "border-[var(--admin-primary)]",
        ),
      );
    card.classList.add(
      "drag-over",
      "border-dashed",
      "border-2",
      "border-[var(--admin-primary)]",
    );
  };

  const handleDrop = async (e, sec, toIdx) => {
    e.preventDefault();
    if (!dragSrc || dragSrc.sec !== sec) return;
    if (dragSrc.idx === toIdx) {
      handleDragEnd(e);
      return;
    }

    const arr = [...getSectionData(sec)];
    const [moved] = arr.splice(dragSrc.idx, 1);
    arr.splice(toIdx, 0, moved);

    // Optimistic update
    setData((prev) => ({ ...prev, [sec]: arr }));
    setDragSrc(null);
    setOpenEdit({ section: null, id: null });
    handleDragEnd(e);

    // Save new order to backend sequentially
    try {
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const newRank = i + 1;
        const itemId = item.contentId || item._id; // BB/TR use contentId, CS uses _id

        const endpoint =
          sec === "bb"
            ? `/api/admin/blockbusters/${itemId}`
            : sec === "tr"
              ? `/api/admin/trending/${itemId}`
              : `/api/admin/coming-soon/${itemId}`;

        const method = sec === "cs" ? "PUT" : "POST";
        let body;
        let headers = {};

        if (sec === "cs") {
          const fd = new FormData();
          fd.append("rank", newRank);
          fd.append("title", item.title);
          fd.append("expectedReleaseDate", item.expectedReleaseDate || "");
          fd.append("isActive", item.isActive);
          body = fd;
        } else {
          body = JSON.stringify({
            rank: newRank,
            contentType: item.contentType,
          });
          headers = { "Content-Type": "application/json" };
        }

        await fetch(endpoint, { method, headers, body });
      }
      notify("Order saved");
    } catch (err) {
      notify("Failed to save order", "error");
      fetchAll();
    }
  };

  const handleSaveEdit = async (sec, id) => {
    try {
      const endpoint =
        sec === "cs"
          ? `/api/admin/coming-soon/${id}`
          : sec === "tr"
            ? `/api/admin/trending/${id}`
            : `/api/admin/blockbusters/${id}`;

      if (sec === "cs") {
        const fd = new FormData();
        fd.append("title", editForm.title);
        fd.append("description", editForm.description);
        fd.append("expectedReleaseDate", editForm.release);
        fd.append("isActive", editForm.status === "active");
        await fetch(endpoint, { method: "PUT", body: fd });
      } else {
        // Blockbusters and Trending: updating the base Content object
        const fd = new FormData();
        fd.append("title", editForm.title);
        fd.append("description", editForm.description);
        // Assuming we have a lightweight content update endpoint, or we just skip this feature since the backend buildContentPayload is restrictive.
        // For now, we will NOT update base content here to avoid data loss.
        notify(
          "Inline editing of series name is disabled for Blockbusters/Trending to prevent data loss. Please edit the Series directly.",
          "error",
        );
        return;
      }

      notify("Changes saved");
      setOpenEdit({ section: null, id: null });
      fetchAll();
    } catch (err) {
      notify("Failed to save changes", "error");
    }
  };

  const handleDelete = async (sec, id) => {
    if (!confirm("Remove this item?")) return;
    try {
      const endpoint =
        sec === "bb"
          ? `/api/admin/blockbusters/${id}`
          : sec === "tr"
            ? `/api/admin/trending/${id}`
            : `/api/admin/coming-soon/${id}`;
      await fetch(endpoint, { method: "DELETE" });
      notify("Item removed");
      fetchAll();
    } catch (err) {
      notify("Failed to remove item", "error");
    }
  };

  const handleNotify = async (id) => {
    try {
      await fetch(`/api/admin/coming-soon/${id}/notify`, { method: "POST" });
      notify("Users notified successfully");
    } catch (err) {
      notify("Failed to notify users", "error");
    }
  };

  const handleToggleFlag = async (item, flagKey, newVal) => {
    try {
      const contentId =
        activeSection === "cs" ? item._id : item.contentId || item._id;

      if (activeSection === "cs") {
        if (flagKey === "isActive") {
          const fd = new FormData();
          fd.append("title", item.title);
          fd.append("description", item.description || "");
          fd.append("expectedReleaseDate", item.expectedReleaseDate || "");
          fd.append("isActive", String(newVal));

          const response = await fetch(`/api/admin/coming-soon/${contentId}`, {
            method: "PUT",
            body: fd,
          });
          const payload = await response.json();
          if (!response.ok || !payload.success)
            throw new Error(payload.message || "Failed to update status");
          notify("Coming soon status updated");
          fetchAll();
        }
      } else {
        const response = await fetch(`/api/admin/content/${contentId}/flags`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [flagKey]: newVal }),
        });
        const payload = await response.json();
        if (!response.ok || !payload.success)
          throw new Error(payload.message || "Failed to update flags");
        notify("Status updated");
        fetchAll();
      }
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <div className="flex h-[720px] rounded-xl border border-[var(--admin-border)] overflow-hidden bg-[var(--admin-surface)]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .switch-lib { position: relative; display: inline-block; width: 34px; height: 18px; cursor: pointer; flex-shrink: 0; }
        .switch-lib input { opacity: 0; width: 0; height: 0; }
        .slider-lib { position: absolute; inset: 0; background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: 20px; transition: .18s; }
        .slider-lib::before { content: ""; position: absolute; width: 12px; height: 12px; left: 2px; top: 2px; background: #6b7080; border-radius: 50%; transition: .18s; }
        .switch-lib input:checked + .slider-lib { background: #fdf2f8; border-color: #ec1f6b; }
        .switch-lib input:checked + .slider-lib::before { transform: translateX(16px); background: #ec1f6b; }
        .switch-lib input:checked.trend + .slider-lib { background: #f5f3ff; border-color: #8b5cf6; }
        .switch-lib input:checked.trend + .slider-lib::before { background: #8b5cf6; }
        .switch-lib input:checked.block + .slider-lib { background: #fffbeb; border-color: #f59e0b; }
        .switch-lib input:checked.block + .slider-lib::before { background: #f59e0b; }
      `,
        }}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--admin-border)]">
          <Trophy className="text-[var(--admin-primary)]" size={18} />
          <h2 className="text-sm font-semibold text-[var(--admin-foreground)]">
            Featured Content
          </h2>
        </div>

        {/* Switcher */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--admin-border)] bg-[var(--admin-background)]">
          <button
            onClick={() => {
              setActiveSection("bb");
              setOpenEdit({ section: null, id: null });
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition ${activeSection === "bb" ? "bg-[var(--admin-primary)]/10 border-[var(--admin-primary)] text-[var(--admin-primary)]" : "bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-soft)]"}`}
          >
            <Shield size={14} /> Blockbusters
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeSection === "bb" ? "bg-[var(--admin-primary)] text-white" : "bg-[var(--admin-soft)] text-[var(--admin-muted)]"}`}
            >
              {data.bb.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSection("tr");
              setOpenEdit({ section: null, id: null });
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition ${activeSection === "tr" ? "bg-[var(--admin-primary)]/10 border-[var(--admin-primary)] text-[var(--admin-primary)]" : "bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-soft)]"}`}
          >
            <TrendingUp size={14} /> Trending
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeSection === "tr" ? "bg-[var(--admin-primary)] text-white" : "bg-[var(--admin-soft)] text-[var(--admin-muted)]"}`}
            >
              {data.tr.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSection("cs");
              setOpenEdit({ section: null, id: null });
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition ${activeSection === "cs" ? "bg-[var(--admin-primary)]/10 border-[var(--admin-primary)] text-[var(--admin-primary)]" : "bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-soft)]"}`}
          >
            <Clock size={14} /> Coming soon
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeSection === "cs" ? "bg-[var(--admin-primary)] text-white" : "bg-[var(--admin-soft)] text-[var(--admin-muted)]"}`}
            >
              {data.cs.length}
            </span>
          </button>

          <div className="flex-1" />
          <span className="text-[11px] text-[var(--admin-muted)] flex items-center gap-1">
            <GripVertical size={12} /> Drag to reorder
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-[var(--admin-primary)]" />
            </div>
          ) : getSectionData(activeSection).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[var(--admin-border)] rounded-lg p-8 text-[var(--admin-muted)]">
              <span className="text-xs">No items in this section</span>
            </div>
          ) : (
            getSectionData(activeSection).map((item, idx) => {
              const itemId = activeSection === "cs" ? item._id : item.contentId;
              const isEdit =
                openEdit.section === activeSection && openEdit.id === itemId;
              const content = activeSection === "cs" ? item : item.content;
              const title = content?.title || "Unknown title";
              const desc = content?.description || "No description";
              const added =
                activeSection === "cs" ? item.createdAt : item.addedAt;
              const thumbUrl = content?.posterUrl || content?.thumbnailUrl;

              return (
                <React.Fragment key={itemId}>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, activeSection, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, activeSection)}
                    onDrop={(e) => handleDrop(e, activeSection, idx)}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] hover:border-[var(--admin-muted)] transition cursor-grab"
                  >
                    <GripVertical
                      size={16}
                      className="text-[var(--admin-muted)] shrink-0"
                    />

                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${idx < 3 ? "bg-[var(--admin-primary)]/10 text-[var(--admin-primary)]" : "bg-[var(--admin-soft)] text-[var(--admin-muted)]"}`}
                    >
                      P{idx + 1}
                    </div>

                    <div className="w-10 h-10 shrink-0 rounded overflow-hidden bg-[var(--admin-soft)] flex items-center justify-center border border-[var(--admin-border)]">
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] font-bold text-[var(--admin-muted)]">
                          {title.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[var(--admin-foreground)] truncate">
                        {title}
                      </div>
                      <div className="text-[10px] text-[var(--admin-muted)] truncate">
                        {desc}
                      </div>
                      {activeSection === "cs" ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                          />
                          <span
                            className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
                          >
                            {item.isActive ? "Active" : "Suspended"}
                          </span>
                          {item.expectedReleaseDate ? (
                            <span className="text-[9px] text-[var(--admin-muted)] flex items-center gap-0.5">
                              <Calendar size={10} />{" "}
                              {new Date(
                                item.expectedReleaseDate,
                              ).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-[9px] text-[var(--admin-muted)]">
                              No release date
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-[var(--admin-primary)] flex items-center gap-0.5">
                            <Bell size={10} /> {item.notifyUsers?.length || 0}{" "}
                            waiting
                          </span>
                        </div>
                      ) : (
                        <div className="text-[9px] text-[var(--admin-muted)] mt-0.5">
                          Added {new Date(added).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Toggles */}
                    <div
                      className="flex items-center gap-3 px-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {activeSection === "cs" && (
                        <div className="flex items-center gap-1.5">
                          <label className="switch-lib">
                            <input
                              type="checkbox"
                              checked={!!item.isActive}
                              onChange={(e) =>
                                handleToggleFlag(
                                  item,
                                  "isActive",
                                  e.target.checked,
                                )
                              }
                            />
                            <span className="slider-lib"></span>
                          </label>
                          <span className="text-[10px] font-bold text-[var(--admin-muted)]">
                            Active
                          </span>
                        </div>
                      )}
                      {activeSection === "tr" && (
                        <div className="flex items-center gap-1.5">
                          <label className="switch-lib">
                            <input
                              className="trend"
                              type="checkbox"
                              checked={!!content?.isTrending}
                              onChange={(e) =>
                                handleToggleFlag(
                                  item,
                                  "isTrending",
                                  e.target.checked,
                                )
                              }
                            />
                            <span className="slider-lib"></span>
                          </label>
                          <span className="text-[10px] font-bold text-[var(--admin-muted)]">
                            Trending
                          </span>
                        </div>
                      )}
                      {activeSection === "bb" && (
                        <div className="flex items-center gap-1.5">
                          <label className="switch-lib">
                            <input
                              className="block"
                              type="checkbox"
                              checked={!!content?.isBlockbuster}
                              onChange={(e) =>
                                handleToggleFlag(
                                  item,
                                  "isBlockbuster",
                                  e.target.checked,
                                )
                              }
                            />
                            <span className="slider-lib"></span>
                          </label>
                          <span className="text-[10px] font-bold text-[var(--admin-muted)]">
                            Blockbuster
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 shrink-0">
                      {activeSection === "cs" && (
                        <button
                          onClick={() => handleNotify(itemId)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] border border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-soft)]"
                        >
                          <Bell size={12} /> Notify
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(activeSection, itemId)}
                        className="w-7 h-7 rounded flex items-center justify-center border border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
