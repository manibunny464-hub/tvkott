"use client";

import Swal from "sweetalert2";

/* eslint-disable @next/next/no-img-element, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, jsx-a11y/alt-text */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  Clapperboard,
  CreditCard,
  Crown,
  Download,
  Eye,
  FileVideo,
  Film,
  Gauge,
  GripVertical,
  Globe,
  Image,
  Layers3,
  LayoutDashboard,
  LayoutGrid,
  List,
  Loader2,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  Palette,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Tv,
  UploadCloud,
  Users,
  User,
  Video,
  WandSparkles,
  X,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  StopCircle,
  Zap,
  Clock,
  AlertTriangle,
  Trophy,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import React, { useEffect, useState, useRef, useTransition } from "react";
import FeaturedContentView from "./FeaturedContentView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import SubscribersView from "./SubscribersView";
import TransactionsView from "./TransactionsView";
import SubscriptionAnalytics from "./SubscriptionAnalytics";

const navItems = [
  {
    href: "/admin",
    view: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  //   {
  //     href: "/admin/content",
  //     view: "content",
  //     label: "Content Hub",
  //     icon: Film,
  //     permission: "content",
  //   },
  {
    href: "/admin/series",
    view: "series",
    label: "Series",
    icon: Tv,
    permission: "series",
  },
  {
    href: "/admin/users",
    view: "users",
    label: "Users",
    icon: Users,
    permission: "users",
  },
  {
    href: "/admin/subscribers",
    view: "subscribers",
    label: "Subscribers",
    icon: Users,
    permission: "users",
  },
  {
    href: "/admin/seasons",
    view: "seasons",
    label: "Seasons",
    icon: ChevronRight,
    permission: "seasons",
  },
  {
    href: "/admin/episodes",
    view: "episodes",
    label: "Episodes",
    icon: PlayCircle,
    permission: "episodes",
  },
  {
    href: "/admin/trailers-admin",
    view: "trailers-admin",
    label: "Trailers",
    icon: Video,
    permission: "trailers",
  },
  {
    href: "/admin/banners",
    view: "banners",
    label: "Banners",
    icon: Image,
    permission: "banners",
  },
  {
    href: "/admin/artists",
    view: "artists",
    label: "Artist Management",
    icon: Users,
    permission: "content",
  },
  {
    href: "/admin/featured",
    view: "featured",
    label: "Featured Content",
    icon: Trophy,
    permission: "trending",
  },
  //   {
  //     href: "/admin/coming-soon-admin",
  //     view: "coming-soon-admin",
  //     label: "Coming Soon",
  //     icon: Calendar,
  //     permission: "coming-soon",
  //   },
  //   {
  //     href: "/admin/trending-admin",
  //     view: "trending-admin",
  //     label: "Trending",
  //     icon: Activity,
  //     permission: "trending",
  //   },
  //   {
  //     href: "/admin/blockbusters",
  //     view: "blockbusters",
  //     label: "Blockbusters",
  //     icon: Shield,
  //     permission: "blockbusters",
  //   },
  {
    href: "/admin/plans",
    view: "plans",
    label: "Plans",
    icon: CreditCard,
    permission: "plans",
  },
  {
    href: "/admin/categories",
    view: "categories",
    label: "Genres",
    icon: Layers3,
    permission: "categories",
  },
  {
    href: "/admin/analytics",
    view: "analytics",
    label: "Analytics",
    icon: BarChart3,
    permission: "analytics",
  },
  {
    href: "/admin/revenue",
    view: "revenue",
    label: "Revenue",
    icon: Gauge,
    permission: "revenue",
  },
  {
    href: "/admin/transactions",
    view: "transactions",
    label: "Transactions",
    icon: CreditCard,
    permission: "revenue",
  },
  {
    href: "/admin/notifications",
    view: "notifications",
    label: "Notifications",
    icon: Bell,
    permission: "notifications",
  },
  {
    href: "/admin/cms",
    view: "cms",
    label: "CMS Pages",
    icon: Settings,
    permission: "cms",
  },
  {
    href: "/admin/roles",
    view: "roles",
    label: "Roles & Admins",
    icon: Shield,
    permission: "roles",
  },
  {
    href: "/admin/languages",
    view: "languages",
    label: "Languages",
    icon: Globe,
    permission: "settings",
  },
];

const pageTitles = {
  dashboard: "Dashboard",
  content: "Content Hub",
  videos: "Raw Video Management",
  "bulk-upload": "Bulk Raw Upload",
  "video-detail": "Raw Video Detail",
  users: "User Management",
  subscribers: "Subscribers",
  plans: "Subscription Plans",
  categories: "Content Categories",
  languages: "Manage Content Languages",
  analytics: "Analytics",
  revenue: "Revenue & Payments",
  transactions: "Transactions",
  notifications: "Notifications",
  settings: "Settings",
  "master-app-settings": "Master App Settings",
  movies: "Movie Management",
  series: "Series Management",
  seasons: "Season Management",
  episodes: "Episode Management",
  "bulk-episodes": "Bulk Episodes Upload",
  "trailers-admin": "Trailer Management",
  banners: "Banner Management",
  artists: "Artist Management",
  "coming-soon-admin": "Coming Soon Management",
  "trending-admin": "Trending Management",
  blockbusters: "Blockbuster Management",
  cms: "CMS Pages",
  roles: "Roles & Permissions",
};

const chartColors = ["#00d9ff", "#ff1f8f", "#ffb21f", "#16a34a", "#64748b"];
const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const numberFormat = new Intl.NumberFormat("en-IN");

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toLocalDatetimeString(dateInput) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const tzoffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
}

function compactNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDurationLabel(seconds) {
  const value = Math.round(Number(seconds || 0));
  if (!value) return "Detects from video";
  const minutes = Math.floor(value / 60);
  const remainingSeconds = value % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function readVideoDuration(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(0);
      return;
    }

    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(video.duration || 0));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video duration"));
    };
    video.src = url;
  });
}

const apiCache = new Map();

function getViewApiUrl(view, seriesId = null) {
  switch (view) {
    case "dashboard":
      return "/api/admin/dashboard";
    case "series":
      return "/api/admin/series?page=1";
    case "movies":
      return "/api/admin/movies?page=1";
    case "seasons":
    case "episodes":
    case "bulk-episodes":
      return "/api/admin/series?limit=100";
    case "trailers-admin":
      return "/api/admin/series?limit=200";
    case "banners":
      return "/api/admin/banners?page=1";
    case "users":
      return "/api/admin/users?page=1";
    case "subscribers":
      return "/api/admin/subscribers?page=1";
    case "plans":
      return "/api/admin/plans";
    case "categories":
      return "/api/admin/categories";
    case "languages":
      return "/api/admin/languages";
    case "analytics":
      return "/api/admin/analytics?range=30d";
    case "revenue":
      return "/api/admin/revenue";
    case "transactions":
      return "/api/admin/transactions";
    case "notifications":
      return "/api/admin/notifications";
    case "settings":
    case "master-app-settings":
      return "/api/admin/settings";
    case "cms":
      return "/api/admin/cms";
    case "artists":
      return "/api/artists";
    case "roles":
      return "/api/admin/roles";
    case "featured":
      return "/api/admin/featured";
    case "videos":
      return "/api/admin/videos";
    case "coming-soon-admin":
      return "/api/admin/coming-soon?page=1";
    case "trending-admin":
      return "/api/admin/trending?page=1";
    case "blockbusters":
      return "/api/admin/blockbusters?page=1";
    default:
      return null;
  }
}

function prefetchViewData(view, seriesId = null) {
  const url = getViewApiUrl(view, seriesId);
  if (url && !apiCache.has(url)) {
    apiFetch(url).catch(() => {});
  }
}

async function showConfirm(title, text = "This action cannot be undone.", confirmButtonText = "Yes, delete it!") {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ec3f6f",
    cancelButtonColor: "#6c757d",
    confirmButtonText,
    background: "var(--admin-surface, #ffffff)",
    color: "var(--admin-foreground, #0f172a)",
  });
  return result.isConfirmed;
}

function updateCacheItem(sid, updates) {
  for (const [key, value] of apiCache.entries()) {
    if (value && typeof value === "object") {
      let modified = false;

      // 1. If it's a list under `series`
      if (Array.isArray(value.series)) {
        const nextList = value.series.map((item) => {
          if ((item._id || item.id) === sid) {
            modified = true;
            return { ...item, ...updates };
          }
          return item;
        });
        if (modified) value.series = nextList;
      }

      // 2. If it's a list under `movies`
      if (Array.isArray(value.movies)) {
        const nextList = value.movies.map((item) => {
          if ((item._id || item.id) === sid) {
            modified = true;
            return { ...item, ...updates };
          }
          return item;
        });
        if (modified) value.movies = nextList;
      }

      // 3. If it's single series details under `series`
      if (value.series && typeof value.series === "object" && !Array.isArray(value.series)) {
        if ((value.series._id || value.series.id) === sid) {
          value.series = { ...value.series, ...updates };
          modified = true;
        }
      }

      // 4. If it's dashboard recentUploads
      if (value.data && typeof value.data === "object") {
        const d = value.data;
        if (Array.isArray(d.recentUploads)) {
          const nextUploads = d.recentUploads.map((item) => {
            if ((item._id || item.id) === sid) {
              modified = true;
              return { ...item, ...updates };
            }
            return item;
          });
          if (modified) d.recentUploads = nextUploads;
        }
      }

      if (modified) {
        apiCache.set(key, value);
      }
    }
  }
}

async function apiFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  if (method !== "GET") {
    const isFlagsUpdate = url.includes("/flags") && method === "PUT";
    if (!isFlagsUpdate) {
      apiCache.clear();
    }
  }

  if (method === "GET") {
    if (apiCache.has(url)) {
      fetch(url, {
        ...options,
        headers: {
          "content-type": "application/json",
          ...(options.headers || {}),
        },
      })
        .then((res) => res.json().catch(() => ({})))
        .then((payload) => {
          if (payload && payload.success) {
            apiCache.set(url, payload);
          }
        })
        .catch(() => {});
      return apiCache.get(url);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  if (method === "GET") {
    apiCache.set(url, payload);
  }

  return payload;
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      message: text.slice(0, 200) || "Server returned an invalid response",
    };
  }
}

function applyTheme(settings, darkMode) {
  if (typeof document === "undefined") return;
  const theme = settings?.theme || {};
  const root = document.documentElement;
  const radius = Number(theme.radius || 8);
  const values = {
    "--admin-primary": theme.primary,
    "--admin-accent": theme.accent,
    "--admin-warning": theme.warning,
    "--admin-background": theme.background,
    "--admin-surface": theme.surface,
    "--admin-foreground": theme.foreground,
    "--admin-muted": theme.muted,
    "--admin-border": darkMode ? "#1f3a44" : "#dce8ec",
    "--admin-soft": darkMode ? "#102b34" : "#edf7fa",
    "--background": theme.background,
    "--foreground": theme.foreground,
    "--radius-sm": `${radius}px`,
    "--radius-md": `${radius}px`,
    "--radius-lg": `${radius + 2}px`,
  };

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null)
      root.style.setProperty(key, value);
  });
  root.classList.toggle("dark-admin", Boolean(darkMode));
}

function StatusBadge({ status }) {
  const tone =
    status === "Live" ||
    status === "Uploaded" ||
    status === "Active" ||
    status === "success"
      ? "green"
      : status === "Failed" || status === "Suspended" || status === "failed"
        ? "red"
        : status === "Processing" || status === "pending"
          ? "amber"
          : "cyan";

  return <Badge tone={tone}>{status}</Badge>;
}

function displayEpisodeUploadStatus(status) {
  if (!status || status === "queued") return "Uploaded";
  if (status === "uploaded") return "Uploaded";
  if (status === "completed") return "Uploaded";
  if (status === "live") return "Live";
  if (status === "processing") return "Processing";
  if (status === "uploading") return "Uploading";
  if (status === "failed") return "Failed";
  if (status === "pending") return "Pending";
  if (status === "ready") return "Ready";
  return status;
}

function SkeletonBlock({ className }) {
  return <div className={cn("skeleton rounded-[8px]", className)} />;
}

function PinkLoader({ className }) {
  return (
    <div className={cn("grid min-h-64 place-items-center", className)}>
      <div className="relative h-14 w-14" role="status" aria-label="Loading">
        <div className="absolute inset-0 rounded-full border-4 border-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)]" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-[var(--admin-accent)] border-t-[var(--admin-accent)] shadow-[0_0_34px_rgba(255,31,143,0.34)]" />
      </div>
    </div>
  );
}

const IMAGE_DIMENSION_HINTS = {
  poster: {
    label: "Poster",
    recommended: "400 × 600 px (2:3 aspect ratio)",
    ratio: "2/3",
    note: "Used for portrait movie/series covers.",
  },
  banner: {
    label: "Banner",
    recommended: "1920 × 1080 px (16:9 aspect ratio)",
    ratio: "16/9",
    note: "Used for background banner displays.",
  },
  thumbnail: {
    label: "Thumbnail",
    recommended: "640 × 360 px (16:9 aspect ratio)",
    ratio: "16/9",
    note: "Used for episode or trailer previews.",
  },
  benefit: {
    label: "Benefit Icon",
    recommended: "128 × 128 px (1:1 aspect ratio)",
    ratio: "1/1",
    note: "PNG/SVG, 1:1 square icon image.",
  },
};

function ImageUploadField({
  label,
  currentUrl,
  file,
  onFileChange,
  onClear,
  aspectRatio = "16 / 9",
  disabled = false,
  hintKey = "thumbnail",
}) {
  const fileInputRef = useRef(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl || "");
  const [isDragging, setIsDragging] = useState(false);

  const hint = IMAGE_DIMENSION_HINTS[hintKey] || {
    recommended: "Flexible",
    note: "Supported aspect ratio.",
  };

  useEffect(() => {
    if (file) {
      setIsRemoved(false);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    if (!isRemoved) {
      setPreviewUrl(currentUrl || "");
    }
    return undefined;
  }, [file, currentUrl, isRemoved]);

  const handleClear = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsRemoved(true);
    setPreviewUrl("");
    if (onFileChange) {
      onFileChange(null);
    }
    if (onClear) {
      onClear();
    }
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setIsRemoved(false);
    onFileChange(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setIsRemoved(false);
      onFileChange(dropped);
    }
  };

  return (
    <div className="space-y-1.5 rounded-[var(--radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
      <div className="flex justify-between items-start">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-foreground)]">
          {label}
        </label>
        <span className="text-[10px] bg-[var(--admin-soft)] px-2 py-0.5 rounded text-[var(--admin-primary)] font-semibold">
          {hint.recommended}
        </span>
      </div>

      <div
        className={cn(
          "grid min-h-[140px] place-items-center overflow-hidden rounded-[var(--radius-sm)] border border-dashed relative group transition",
          isDragging
            ? "border-[var(--admin-primary)] bg-[var(--admin-soft)]"
            : "border-[var(--admin-border)] bg-[var(--admin-soft)]",
          !previewUrl && !disabled ? "cursor-pointer hover:border-[var(--admin-primary)]" : ""
        )}
        style={{ aspectRatio }}
        onClick={() => {
          if (!previewUrl && !disabled) {
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt={`${label} preview`}
              className="h-full w-full object-cover"
            />
            {/* Top right prominent X button overlay on preview */}
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title={`Remove ${label}`}
                aria-label={`Remove ${label}`}
              >
                <X size={15} strokeWidth={2.5} />
              </button>
            )}

            {/* Hover overlay with Change Image */}
            <div
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <span className="text-white text-xs font-semibold bg-[var(--admin-accent)] px-3 py-1 rounded shadow">
                Change Image
              </span>
            </div>
          </div>
        ) : (
          <div className="px-4 py-5 text-center text-xs text-[var(--admin-muted)] flex flex-col items-center gap-2 pointer-events-none">
            <Image size={24} className="text-[var(--admin-muted)]" />
            <span>Click to upload or drag & drop</span>
          </div>
        )}
      </div>

      <p className="text-[10px] text-[var(--admin-muted)] leading-tight">
        {hint.note}
      </p>

      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          disabled={disabled}
          className="cursor-pointer text-xs"
        />
        {previewUrl || file || (!isRemoved && currentUrl) ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={disabled}
            aria-label={`Clear ${label.toLowerCase()}`}
            title={`Clear ${label.toLowerCase()}`}
            className="text-red-500 hover:bg-red-500/10 hover:text-red-600 shrink-0"
          >
            <X size={16} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function VideoUploadField({
  label,
  currentUrl,
  file,
  onFileChange,
  disabled = false,
  folder = "episodes",
  onDirectUpload = null, // Optional custom handler (legacy / trailers)
}) {
  const [status, setStatus] = useState("idle"); // idle | uploading | paused | error | cancelled
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const [localFile, setLocalFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const controllerRef = useRef(null);
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;

    let duration = 0;
    try {
      duration = await new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          resolve(video.duration);
        };
        video.onerror = () => resolve(0);
        video.src = URL.createObjectURL(selectedFile);
      });
    } catch (err) {
      console.warn("Failed to extract video duration", err);
    }

    if (onDirectUpload) {
      // Legacy path — no multipart
      setLocalFile(selectedFile);
      setStatus("uploading");
      setProgress(10);
      try {
        const result = await onDirectUpload(selectedFile, (p) =>
          setProgress(p),
        );
        const uploadData =
          typeof result === "string" ? { url: result } : result;
        onFileChange({
          url: uploadData.url,
          key: uploadData.key,
          duration,
          size: selectedFile.size,
          type: selectedFile.type,
          file: selectedFile,
        });
        setStatus("idle");
      } catch (err) {
        console.error("Direct upload failed:", err);
        setStatus("error");
        setErrorMsg(err.message || "Upload failed");
      } finally {
        setProgress(0);
      }
      return;
    }

    // Multipart upload path with pause/resume/cancel
    setLocalFile(selectedFile);
    setStatus("uploading");
    setProgress(0);
    setSpeed(0);
    setEta(0);
    setErrorMsg("");

    const ctrl = createMultipartUpload(
      selectedFile,
      folder,
      (pct, bps, etaSec) => {
        setProgress(pct);
        setSpeed(bps);
        setEta(etaSec);
      },
    );
    controllerRef.current = ctrl;

    try {
      const result = await ctrl.promise;
      onFileChange({
        url: result.url,
        key: result.key,
        duration,
        size: selectedFile.size,
        type: selectedFile.type,
        file: selectedFile,
      });
      setStatus("idle");
      setProgress(0);
    } catch (err) {
      if (err.message === "Upload cancelled") {
        setStatus("cancelled");
      } else {
        setStatus("error");
        setErrorMsg(err.message || "Upload failed");
      }
    } finally {
      controllerRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handlePause = () => {
    controllerRef.current?.pause();
    setStatus("paused");
  };
  const handleResume = () => {
    controllerRef.current?.resume();
    setStatus("uploading");
  };
  const handleCancel = () => {
    controllerRef.current?.cancel();
    setStatus("cancelled");
    setProgress(0);
    setLocalFile(null);
  };
  const handleReset = () => {
    setStatus("idle");
    setProgress(0);
    setSpeed(0);
    setEta(0);
    setLocalFile(null);
    setErrorMsg("");
  };

  const isUploading = status === "uploading";
  const isPaused = status === "paused";
  const isActive = isUploading || isPaused;

  return (
    <div className="space-y-1.5 rounded-[var(--radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3">
      <div className="flex justify-between items-start">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-foreground)]">
          {label}
        </label>
        <span className="text-[10px] bg-[var(--admin-soft)] px-2 py-0.5 rounded text-[var(--admin-accent)] font-semibold">
          MP4 / WebM / MKV
        </span>
      </div>

      <div className="grid min-h-[100px] place-items-center rounded-[var(--radius-sm)] border border-dashed border-[var(--admin-border)] bg-[var(--admin-soft)]">
        {currentUrl ? (
          <div className="w-full px-4 py-3 text-center text-xs text-[var(--admin-foreground)] flex flex-col items-center gap-2">
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold text-green-600 flex items-center gap-1">
                <FileVideo size={16} className="text-green-500 shrink-0" />{" "}
                Video File Linked
              </span>
              <span
                className="text-[10px] text-[var(--admin-muted)] max-w-[150px] truncate"
                title={currentUrl}
              >
                {currentUrl.split("/").pop()}
              </span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-emerald-100 dark:border-emerald-900 bg-black aspect-video w-full max-w-[280px] mx-auto shadow-sm">
              <video
                src={currentUrl}
                controls
                preload="metadata"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : isActive ? (
          <div className="w-full px-4 py-3 space-y-3">
            {/* File name */}
            <div className="flex items-center gap-2 min-w-0">
              <FileVideo size={16} className="shrink-0 text-blue-500" />
              <span
                className="text-xs font-semibold text-[var(--admin-foreground)] truncate flex-1"
                title={localFile?.name}
              >
                {localFile?.name}
              </span>
              <span className="text-[10px] text-[var(--admin-muted)] shrink-0">
                {localFile
                  ? (localFile.size / 1024 / 1024).toFixed(1) + " MB"
                  : ""}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs font-black ${isPaused ? "text-amber-600" : "text-blue-600"}`}
                >
                  {isPaused ? "⏸ Paused" : "Uploading"} — {progress}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-[var(--admin-border)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isPaused
                      ? "bg-amber-400"
                      : "bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Speed + ETA */}
            {isUploading && (
              <div className="flex items-center gap-4 text-[11px] text-[var(--admin-muted)]">
                <span className="flex items-center gap-1 font-bold text-[var(--admin-foreground)]">
                  <Zap size={11} className="text-yellow-500" />
                  {formatSpeed(speed)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  ETA: {formatEta(eta)}
                </span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2">
              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResume}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                >
                  <Play size={12} /> Resume
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition"
                >
                  <Pause size={12} /> Pause
                </button>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 hover:bg-red-50 text-red-600 text-xs font-bold transition"
              >
                <StopCircle size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : status === "error" ? (
          <div className="px-4 py-3 text-center flex flex-col items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            <span className="text-xs font-bold text-red-600">
              Upload Failed
            </span>
            <span
              className="text-[10px] text-red-500 max-w-[200px] truncate"
              title={errorMsg}
            >
              {errorMsg}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-bold"
            >
              <RefreshCcw size={11} /> Retry
            </button>
          </div>
        ) : status === "cancelled" ? (
          <div className="px-4 py-3 text-center flex flex-col items-center gap-2">
            <XCircle size={20} className="text-[var(--admin-muted)]" />
            <span className="text-xs text-[var(--admin-muted)] font-semibold">
              Upload cancelled
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs px-3 py-1 border border-[var(--admin-border)] hover:bg-[var(--admin-soft)] rounded font-bold text-[var(--admin-foreground)]"
            >
              <RefreshCcw size={11} /> Try Again
            </button>
          </div>
        ) : file ? (
          <div className="px-4 py-3 text-center text-xs text-[var(--admin-foreground)] flex flex-col items-center gap-1.5">
            <FileVideo size={24} className="text-[var(--admin-primary)]" />
            <span className="font-semibold">{file.name}</span>
            <span className="text-[10px] text-[var(--admin-muted)]">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        ) : (
          <div className="px-4 py-5 text-center text-xs text-[var(--admin-muted)] flex flex-col items-center gap-2">
            <UploadCloud size={24} className="text-[var(--admin-muted)]" />
            <span>Select video file to upload</span>
          </div>
        )}
      </div>

      {!isActive && status !== "cancelled" && (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={disabled || isActive}
            className="cursor-pointer text-xs"
          />
          {file || currentUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                onFileChange(null);
                handleReset();
              }}
              disabled={disabled}
              className="text-red-500 hover:bg-red-50"
              aria-label="Remove video"
            >
              <X size={16} />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function MultiSelectField({
  label,
  placeholder,
  options,
  selected = [],
  onChange,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedList = Array.isArray(selected)
    ? selected
    : typeof selected === "string"
      ? selected
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const handleToggle = (value) => {
    let next;
    if (selectedList.includes(value)) {
      next = selectedList.filter((item) => item !== value);
    } else {
      next = [...selectedList, value];
    }
    onChange(next);
  };

  return (
    <div className="space-y-1.5 relative">
      <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-foreground)] outline-none transition focus:border-[var(--admin-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--admin-primary)_18%,transparent)]"
        >
          <span className="truncate">
            {selectedList.length > 0 ? selectedList.join(", ") : placeholder}
          </span>
          <ChevronDown size={16} className="text-[var(--admin-muted)]" />
        </button>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2 shadow-lg">
              {options.map((opt) => {
                const name =
                  typeof opt === "string" ? opt : opt.name || opt.englishName;
                const value =
                  typeof opt === "string" ? opt : opt.name || opt.englishName;
                const isChecked = selectedList.includes(value);
                return (
                  <label
                    key={value}
                    className="flex items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm hover:bg-[var(--admin-soft)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={() => handleToggle(value)}
                      className="rounded border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-0"
                    />
                    <span>{name}</span>
                  </label>
                );
              })}
              {options.length === 0 && (
                <div className="p-2 text-center text-xs text-[var(--admin-muted)]">
                  No options available
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon = Sparkles, title, description, action }) {
  return (
    <div className="grid min-h-60 place-items-center rounded-[var(--radius-md)] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-[8px] bg-[var(--admin-soft)] text-[var(--admin-primary)]">
          <Icon size={22} />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--admin-muted)]">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

function ToastStack({ toasts, dismiss }) {
  return (
    <div className="fixed right-4 top-4 z-[80] flex w-[min(360px,calc(100vw-24px))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 18, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 18, scale: 0.98 }}
            className={cn(
              "rounded-[8px] border bg-[var(--admin-surface)] p-4 shadow-[0_18px_60px_rgba(7,18,23,0.16)]",
              toast.type === "error"
                ? "border-rose-200"
                : "border-[var(--admin-border)]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold">{toast.message}</p>
              <button
                type="button"
                className="text-[var(--admin-muted)]"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function FetchingBar({ active }) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-x-0 top-0 z-[90] h-1 overflow-hidden bg-[color-mix(in_srgb,var(--admin-accent)_14%,transparent)]"
          role="status"
          aria-label="Loading admin data"
        >
          <motion.div
            className="h-full w-1/3 rounded-r-full bg-[var(--admin-accent)] shadow-[0_0_22px_rgba(255,31,143,0.38)]"
            animate={{ x: ["-120%", "320%"] }}
            transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Sidebar({
  activeView,
  collapsed,
  setCollapsed,
  settings,
  admin,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
  selectedSeriesId,
  setSelectedSeriesId,
  selectedSeriesTitle,
  setSelectedSeriesTitle,
  seriesList = [],
}) {
  const [contentHubOpen, setContentHubOpen] = useState(true);

  const hasPermission = (item) => {
    if (admin?.role === "super_admin") return true;
    if (!item.permission) return true;
    return admin?.permissions?.includes(item.permission);
  };

  const contentHubItems = navItems.filter((item) =>
    [
      "series",
      "seasons",
      "episodes",
      "trailers-admin",
      "banners",
      "artists",
    ].includes(item.view),
  );

  const flatItems = navItems.filter(
    (item) =>
      ![
        "content",
        "series",
        "seasons",
        "episodes",
        "trailers-admin",
        "banners",
        "artists",
      ].includes(item.view),
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-[var(--admin-border)] bg-[var(--admin-surface)] transition-all duration-300 lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[76px]" : "lg:w-[220px]",
        )}
      >
        <div className="flex h-20 items-center gap-3 border-b border-[var(--admin-border)] px-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-[var(--admin-primary)] font-display text-xl font-black text-[#031216] shadow-[0_0_28px_rgba(0,217,255,0.35)]">
            c
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-semibold">
                {settings?.platformName || "Chirpii Admin"}
              </p>
              <p className="truncate text-xs uppercase tracking-[0.22em] text-[var(--admin-muted)]">
                control room
              </p>
            </div>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {/* Flat Items before Content Hub (like Dashboard) */}
          {flatItems
            .filter((item) => item.view === "dashboard" && hasPermission(item))
            .map((item) => {
              const Icon = item.icon;
              const active = item.view === activeView;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => prefetchViewData(item.view)}
                  onTouchStart={() => prefetchViewData(item.view)}
                  onClick={() => {
                    if (!active) onNavigate(item.view);
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-semibold transition",
                    active
                      ? "bg-[var(--admin-accent)] text-white font-bold shadow-inner"
                      : "text-[var(--admin-muted)] hover:bg-[var(--admin-soft)] hover:text-[var(--admin-foreground)]",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    size={19}
                    className={active ? "text-white" : "text-current"}
                  />
                  {!collapsed ? (
                    <span className="truncate">{item.label}</span>
                  ) : null}
                </Link>
              );
            })}

          {/* Content Hub Section Dropdown */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setContentHubOpen(!contentHubOpen)}
              className={cn(
                "w-full group flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-semibold transition text-left",
                [
                  "series",
                  "seasons",
                  "episodes",
                  "trailers-admin",
                  "banners",
                ].includes(activeView)
                  ? "bg-[var(--admin-soft)]/50 text-[var(--admin-foreground)]"
                  : "text-[var(--admin-muted)] hover:bg-[var(--admin-soft)] hover:text-[var(--admin-foreground)]",
              )}
            >
              <Film size={19} className="text-current" />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span>Content Hub</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-200",
                      contentHubOpen ? "rotate-180" : "",
                    )}
                  />
                </div>
              )}
            </button>

            {contentHubOpen && !collapsed && (
              <div className="mt-1 ml-[30px] space-y-0.5 border-l-2 border-[var(--admin-border)] pl-3">
                {contentHubItems
                  .filter((item) => hasPermission(item))
                  .map((item) => {
                    const Icon = item.icon;
                    const active = item.view === activeView;

                    // Generate proper href (appending series query param if present)
                    let targetHref = item.href;
                    if (selectedSeriesId) {
                      const activeSeries = seriesList.find(s => (s._id || s.id) === selectedSeriesId);
                      const slug = activeSeries?.slug || String(activeSeries?.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      if (slug) {
                        if (item.view === "seasons") {
                          targetHref = `/admin/seasons?series=${slug}`;
                        } else if (item.view === "episodes") {
                          targetHref = `/admin/episodes?series=${slug}`;
                        } else if (item.view === "trailers-admin") {
                          targetHref = `/admin/trailers-admin?series=${slug}`;
                        } else if (item.view === "banners") {
                          targetHref = `/admin/banners?series=${slug}`;
                        }
                      } else {
                        if (item.view === "seasons") {
                          targetHref = `/admin/seasons?seriesId=${selectedSeriesId}`;
                        } else if (item.view === "episodes") {
                          targetHref = `/admin/episodes?seriesId=${selectedSeriesId}`;
                        } else if (item.view === "trailers-admin") {
                          targetHref = `/admin/trailers-admin?seriesId=${selectedSeriesId}`;
                        } else if (item.view === "banners") {
                          targetHref = `/admin/banners?seriesId=${selectedSeriesId}`;
                        }
                      }
                    }

                    return (
                      <Link
                        key={item.href}
                        href={targetHref}
                        prefetch={true}
                        onMouseEnter={() => prefetchViewData(item.view, selectedSeriesId)}
                        onTouchStart={() => prefetchViewData(item.view, selectedSeriesId)}
                        onClick={() => {
                          if (!active) onNavigate(item.view);
                        }}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-xs font-semibold transition w-full",
                          active
                            ? "bg-[var(--admin-accent)] text-white font-bold"
                            : "text-[var(--admin-muted)] hover:bg-[var(--admin-soft)] hover:text-[var(--admin-foreground)]",
                        )}
                      >
                        <Icon size={15} className="shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Other Flat Navigation Items */}
          {flatItems
            .filter((item) => item.view !== "dashboard" && hasPermission(item))
            .map((item) => {
              const Icon = item.icon;
              const active = item.view === activeView;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => prefetchViewData(item.view)}
                  onTouchStart={() => prefetchViewData(item.view)}
                  onClick={() => {
                    if (!active) onNavigate(item.view);
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-semibold transition",
                    active
                      ? "bg-[var(--admin-accent)] text-white font-bold shadow-inner"
                      : "text-[var(--admin-muted)] hover:bg-[var(--admin-soft)] hover:text-[var(--admin-foreground)]",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    size={19}
                    className={active ? "text-white" : "text-current"}
                  />
                  {!collapsed ? (
                    <span className="truncate">{item.label}</span>
                  ) : null}
                </Link>
              );
            })}
        </nav>

        <div className="border-t border-[var(--admin-border)] p-3">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-[8px] border border-[var(--admin-border)] py-2 text-sm text-[var(--admin-muted)] transition hover:bg-[var(--admin-soft)]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronsLeft size={16} />
            )}
            {!collapsed ? "Collapse" : null}
          </button>
          <div className="flex items-center gap-3 rounded-[8px] bg-[var(--admin-soft)] p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--admin-accent)] text-sm font-black text-white">
              {admin?.name?.slice(0, 1) || "A"}
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{admin?.name}</p>
                <p className="truncate text-xs text-[var(--admin-muted)]">
                  {admin?.role}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}

function MobileNav({ activeView, onNavigate, admin }) {
  const mobileItems = navItems
    .filter((item) => {
      if (admin?.role === "super_admin") return true;
      if (!item.permission) return true;
      return admin?.permissions?.includes(item.permission);
    })
    .slice(0, 5);
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1 shadow-[0_16px_50px_rgba(7,18,23,0.18)] lg:hidden">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const active = item.view === activeView;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onTouchStart={() => prefetchViewData(item.view)}
            onClick={() => {
              if (!active) onNavigate(item.view);
            }}
            className={cn(
              "grid place-items-center rounded-[8px] px-1 py-2 text-[11px] font-semibold",
              active
                ? "bg-[var(--admin-soft)] text-[var(--admin-primary)]"
                : "text-[var(--admin-muted)]",
            )}
          >
            <Icon size={18} />
            <span className="mt-1 max-w-full truncate">
              {item.label.split(" ")[0]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function Header({
  title,
  admin,
  darkMode,
  setDarkMode,
  globalSearch,
  setGlobalSearch,
  setMobileMenuOpen,
  collapsed,
  setCollapsed,
  selectedSeriesTitle,
  activeView,
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-[color-mix(in_srgb,var(--admin-background)_86%,transparent)] px-4 backdrop-blur-xl sm:px-5">
      <div className="flex h-16 items-center gap-3">
        {/* Menu toggle button – mobile opens drawer, desktop collapses sidebar */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              setMobileMenuOpen((v) => !v);
            } else {
              setCollapsed((v) => !v);
            }
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)] transition hover:bg-[var(--admin-soft)] hover:text-[var(--admin-foreground)]"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb + title */}
        <div className="min-w-0 flex-1">
          <div className="hidden flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-muted)] sm:flex">
            {[
              "series",
              "seasons",
              "episodes",
              "trailers-admin",
              "banners",
              "bulk-episodes",
            ].includes(activeView) ? (
              <>
                <Link
                  href="/admin"
                  prefetch={true}
                  className="hover:text-[var(--admin-foreground)] transition"
                >
                  Admin
                </Link>
                <ChevronRight size={12} />
                <Link
                  href="/admin/series"
                  prefetch={true}
                  className="hover:text-[var(--admin-foreground)] transition"
                >
                  Content Hub
                </Link>
                {[
                  "seasons",
                  "episodes",
                  "trailers-admin",
                  "banners",
                  "bulk-episodes",
                ].includes(activeView) && (
                  <>
                    <ChevronRight size={12} />
                    <Link
                      href="/admin/series"
                      prefetch={true}
                      className="hover:text-[var(--admin-foreground)] transition"
                    >
                      Series
                    </Link>
                    {selectedSeriesTitle && (
                      <>
                        <ChevronRight size={12} />
                        <span className="truncate max-w-[100px]">
                          {selectedSeriesTitle}
                        </span>
                      </>
                    )}
                    <ChevronRight size={12} />
                    <span className="text-[var(--admin-foreground)] font-black">
                      {title}
                    </span>
                  </>
                )}
                {activeView === "series" && (
                  <>
                    <ChevronRight size={12} />
                    <span className="text-[var(--admin-foreground)] font-black">
                      Series
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/admin"
                  className="hover:text-[var(--admin-foreground)] transition"
                >
                  Admin
                </Link>
                <ChevronRight size={12} />
                <span className="text-[var(--admin-foreground)] font-black">
                  {title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right-side controls */}
        <div className="flex items-center gap-2">
          <label className="relative hidden md:flex items-center min-w-[200px] lg:min-w-[280px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] pointer-events-none"
              size={16}
            />
            <Input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search series, users, plans..."
              className="pl-9 h-9 text-sm"
              aria-label="Global search"
            />
          </label>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setDarkMode((value) => !value)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            aria-label="Notifications"
          >
            <Bell size={17} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-9 items-center gap-2 rounded-[8px] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2.5 text-sm font-semibold transition hover:bg-[var(--admin-soft)]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--admin-accent)] text-xs font-black text-white">
                  {admin?.name?.slice(0, 1) || "A"}
                </span>
                <span className="hidden sm:inline text-sm font-semibold">
                  {admin?.name}
                </span>
                <ChevronDown size={14} className="text-[var(--admin-muted)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/admin/master-app-settings">
                  <Palette size={16} />
                  Master settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={logout}>
                <LogOut size={16} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function PageShell({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="mx-auto w-full max-w-[1580px] px-4 py-6 pb-28 sm:px-6 lg:pb-8"
    >
      {children}
    </motion.main>
  );
}

function DashboardView({ data, loading, notify, refresh }) {
  const [subscribers, setSubscribers] = useState(data?.recentSubscribers || []);
  const [subscribersLoading, setSubscribersLoading] = useState(!data?.recentSubscribers?.length);

  useEffect(() => {
    if (data?.recentSubscribers && data.recentSubscribers.length > 0) {
      setSubscribers(data.recentSubscribers);
      setSubscribersLoading(false);
    } else {
      async function loadSubs() {
        try {
          const res = await apiFetch("/api/admin/subscribers?limit=6");
          if (res?.success && Array.isArray(res.subscribers)) {
            setSubscribers(res.subscribers);
          }
        } catch (e) {
          console.error("Failed to fetch dashboard subscribers:", e);
        } finally {
          setSubscribersLoading(false);
        }
      }
      loadSubs();
    }
  }, [data]);

  if (loading) {
    return (
      <PageShell>
        <PinkLoader className="min-h-[70vh]" />
      </PageShell>
    );
  }

  const stats = data?.stats || {};
  const kpis = [
    {
      label: "Total Series",
      value: compactNumber(stats.totalSeries || 0),
      icon: Tv,
    },
    {
      label: "Total Seasons",
      value: compactNumber(stats.totalSeasons || 0),
      icon: Layers3,
    },
    {
      label: "Total Episodes",
      value: compactNumber(stats.totalEpisodes || 0),
      icon: PlayCircle,
    },
    {
      label: "Total Users",
      value: compactNumber(stats.totalUsers),
      icon: Users,
    },
  ];

  return (
    <PageShell>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--admin-muted)]">
                        {item.label}
                      </p>
                      <p className="mt-3 font-display text-3xl font-semibold">
                        {item.value}
                      </p>
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-[8px] bg-[var(--admin-soft)] text-[var(--admin-primary)]">
                      <Icon size={21} />
                    </div>
                  </div>
                  <div className="mt-5 h-1.5 rounded-full bg-[var(--admin-soft)]">
                    <div
                      className="h-full rounded-full bg-[var(--admin-primary)]"
                      style={{ width: `${60 + index * 9}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Watch activity over last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.viewsOverTime || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--admin-border)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--admin-muted)"
                    fontSize={12}
                  />
                  <YAxis stroke="var(--admin-muted)" fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="var(--admin-primary)"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscribers List Card - Pink, White & Pink Theme */}
        <Card className="flex flex-col justify-between overflow-hidden border border-pink-500/25 bg-[var(--admin-surface)] shadow-[0_10px_35px_rgba(236,63,111,0.08)]">
          <CardHeader className="pb-3 border-b border-pink-500/15 bg-gradient-to-r from-pink-500/10 via-pink-500/[0.03] to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-[#ec3f6f] to-[#ff6b95] text-white shadow-[0_4px_14px_rgba(236,63,111,0.35)] shrink-0">
                  <Crown size={19} />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-[var(--admin-foreground)] flex items-center gap-2">
                    Active Subscribers
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ec3f6f] text-white">
                      Live
                    </span>
                  </CardTitle>
                  <p className="text-[11px] text-[var(--admin-muted)] mt-0.5">
                    Recent members with active subscription plans
                  </p>
                </div>
              </div>
              <Link
                href="/admin/subscribers"
                className="flex items-center gap-1 text-xs font-bold text-[#ec3f6f] hover:text-[#d42c5b] bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-500/30 px-3 py-1.5 rounded-full transition-all hover:shadow-sm"
              >
                <span>View all</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            {subscribersLoading ? (
              <div className="flex items-center justify-center min-h-[260px]">
                <PinkLoader className="min-h-[160px]" />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 min-h-[260px] rounded-xl border border-dashed border-pink-500/20 bg-pink-500/[0.02]">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-pink-500/10 text-[#ec3f6f] mb-3">
                  <Users size={22} />
                </div>
                <p className="font-semibold text-sm text-[var(--admin-foreground)]">
                  No active subscribers yet
                </p>
                <p className="text-xs text-[var(--admin-muted)] max-w-xs mt-1">
                  When users purchase subscriptions through Razorpay, their active profiles will show here.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 admin-modal-scroll">
                {subscribers.slice(0, 6).map((sub, idx) => {
                  const displayName = sub.name || sub.userName || sub.userId?.name || sub.phone || sub.userId?.phone || "Subscriber";
                  const displayId = sub.email || sub.phone || sub.userId?.phone || sub.userId?.email || "";
                  const planTitle = sub.planName || sub.plan || sub.planId?.name || "Premium";
                  const initial = (displayName || "S").charAt(0).toUpperCase();
                  const end = sub.endDate ? formatDate(sub.endDate) : "Active";

                  return (
                    <div
                      key={sub.id || sub._id || idx}
                      className="group flex items-center justify-between p-2.5 rounded-xl border border-pink-500/15 bg-white/60 dark:bg-slate-900/40 hover:bg-pink-500/[0.06] hover:border-pink-500/35 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-[#ec3f6f] to-[#ff7597] text-white font-bold text-xs shadow-[0_2px_8px_rgba(236,63,111,0.25)] shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--admin-foreground)] truncate max-w-[150px] group-hover:text-[#ec3f6f] transition-colors">
                            {displayName}
                          </p>
                          <p className="text-[10px] text-[var(--admin-muted)] truncate max-w-[150px] font-mono">
                            {displayId}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-[#ec3f6f] border border-pink-500/30">
                          {planTitle}
                        </span>
                        <p className="text-[9px] text-[var(--admin-muted)] mt-0.5">
                          Expires: {end}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>

          <div className="border-t border-pink-500/15 bg-gradient-to-r from-pink-500/[0.08] via-pink-500/[0.03] to-transparent px-5 py-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--admin-foreground)] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ec3f6f] animate-pulse" />
              Total Active:{" "}
              <strong className="text-[#ec3f6f]">
                {stats.activeSubscriptions || subscribers.length || 0}
              </strong>
            </span>
            <Link
              href="/admin/subscribers"
              className="text-[#ec3f6f] hover:underline font-bold text-[11px] flex items-center gap-0.5"
            >
              Manage all →
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Episodes added over last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.viewsOverTime || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--admin-border)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--admin-muted)"
                    fontSize={12}
                  />
                  <YAxis stroke="var(--admin-muted)" fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="episodes"
                    stroke="var(--admin-accent)"
                    fill="var(--admin-accent)"
                    fillOpacity={0.16}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 most-watched series</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.topSeries?.length > 0 ? (
                data.topSeries.map((series, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]"
                  >
                    <span className="font-semibold text-sm">
                      {series.title}
                    </span>
                    <span className="text-xs bg-[var(--admin-soft)] px-2 py-1 rounded font-bold text-[var(--admin-accent)]">
                      {series.views} Views
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState icon={Tv} title="No series found" description="" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Episodes by series</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.episodesBySeries || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--admin-border)"
                  />
                  <XAxis
                    dataKey="title"
                    stroke="var(--admin-muted)"
                    fontSize={12}
                  />
                  <YAxis stroke="var(--admin-muted)" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="episodes"
                    fill="var(--admin-primary)"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="seasons"
                    fill="var(--admin-accent)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 most-watched episodes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.topEpisodes?.length > 0 ? (
                data.topEpisodes.map((episode, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]"
                  >
                    <span className="font-semibold text-sm truncate max-w-[70%]">
                      {episode.title}
                    </span>
                    <span className="text-xs bg-[var(--admin-soft)] px-2 py-1 rounded font-bold text-[var(--admin-accent)] shrink-0">
                      {episode.views} Views
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={PlayCircle}
                  title="No episodes found"
                  description=""
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Recent series</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            columns={["Series title", "Status", "Created date", "Views"]}
            rows={(data?.recentUploads || []).map((video) => [
              <Link
                key="title"
                href="/admin/series"
                className="font-semibold hover:text-[var(--admin-primary)]"
              >
                {video.title}
              </Link>,
              <StatusBadge key="status" status={video.status} />,
              formatDate(video.uploadDate),
              numberFormat.format(video.views || 0),
            ])}
            empty="No series yet"
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}

function ResponsiveTable({ columns, rows, empty }) {
  if (!rows?.length) {
    return (
      <div className="rounded-[8px] border border-dashed border-[var(--admin-border)] p-8 text-center text-sm text-[var(--admin-muted)]">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="border-b border-[var(--admin-border)] px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="group">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border-b border-[var(--admin-border)] px-3 py-4 align-middle group-hover:bg-[var(--admin-soft)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ pagination, setPage }) {
  if (!pagination) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--admin-muted)]">
      <span>
        Page {pagination.page} of {pagination.totalPages} · {pagination.total}{" "}
        records
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => setPage((page) => Math.max(1, page - 1))}
        >
          <ChevronLeft size={16} />
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => setPage((page) => page + 1)}
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

function UploadModal({ onUploaded, notify, categories = [] }) {
  const categoryOptions = categories.length
    ? categories
    : ["Drama", "Comedy", "Action", "Family", "Kids", "Romance", "Thriller"];
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState("");
  const [eta, setEta] = useState("");
  const [stage, setStage] = useState("idle");
  const [qualityStatus, setQualityStatus] = useState([
    { quality: "360p", status: "queued" },
    { quality: "480p", status: "queued" },
    { quality: "720p", status: "queued" },
    { quality: "1080p", status: "queued" },
  ]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categoryOptions[0] || "Drama",
    tags: "",
    pricing: "free",
    scheduledPublishAt: "",
  });

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  async function uploadThumbnail() {
    if (!thumbnail) return "";
    const data = new FormData();
    data.append("file", thumbnail);
    data.append("folder", "admin-thumbnails");
    const response = await fetch("/api/upload", { method: "POST", body: data });
    const payload = await readJsonResponse(response);
    if (!response.ok || !payload.success)
      throw new Error(payload.message || "Thumbnail upload failed");
    return payload.url;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setProgress(0);
    setStage(file ? "uploading" : "saving");

    try {
      const thumbnailUrl = await uploadThumbnail();
      const metadata = {
        ...form,
        thumbnailUrl,
      };

      if (!file) {
        await apiFetch("/api/admin/videos", {
          method: "POST",
          body: JSON.stringify({
            ...metadata,
            genres: [form.category],
            tags: form.tags,
            transcodingStatus: "live",
          }),
        });
        notify("Video metadata created");
        setOpen(false);
        onUploaded();
        return;
      }

      if (!file.type.startsWith("video/")) {
        throw new Error("Only video files are supported");
      }

      const init = await apiFetch("/api/admin/videos/upload", {
        method: "POST",
        body: JSON.stringify({
          action: "initiate",
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
        }),
      });

      const totalParts = Math.ceil(file.size / init.partSize);
      const parts = [];
      const startedAt = performance.now();

      for (let partNumber = 1; partNumber <= totalParts; partNumber += 1) {
        const start = (partNumber - 1) * init.partSize;
        const end = Math.min(start + init.partSize, file.size);
        const chunk = file.slice(start, end);
        const signed = await apiFetch("/api/admin/videos/upload", {
          method: "POST",
          body: JSON.stringify({
            action: "sign-part",
            key: init.key,
            uploadId: init.uploadId,
            partNumber,
          }),
        });

        const uploadResponse = await fetch(signed.url, {
          method: "PUT",
          body: chunk,
        });

        if (!uploadResponse.ok) {
          throw new Error(
            "S3 part upload failed. Check bucket CORS and permissions.",
          );
        }

        const loaded = end;
        const elapsed = (performance.now() - startedAt) / 1000;
        const bytesPerSecond = loaded / Math.max(elapsed, 0.1);
        const remaining = (file.size - loaded) / bytesPerSecond;
        setProgress(Math.round((loaded / file.size) * 100));
        setSpeed(`${(bytesPerSecond / 1024 / 1024).toFixed(1)} MB/s`);
        setEta(`${Math.max(1, Math.round(remaining))}s remaining`);
        parts.push({
          PartNumber: partNumber,
          ETag: uploadResponse.headers.get("ETag")?.replaceAll('"', ""),
        });
      }

      if (parts.some((part) => !part.ETag)) {
        throw new Error(
          "S3 did not expose ETag. Add ETag to bucket CORS ExposeHeaders.",
        );
      }

      setStage("processing");
      setQualityStatus((current) =>
        current.map((item, index) => ({
          ...item,
          status: index < 2 ? "ready" : "processing",
        })),
      );

      const complete = await apiFetch("/api/admin/videos/upload", {
        method: "POST",
        body: JSON.stringify({
          action: "complete",
          key: init.key,
          uploadId: init.uploadId,
          parts,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          metadata,
        }),
      });

      setStage("thumbnails");
      setTimeout(() => {
        setQualityStatus((current) =>
          current.map((item) => ({ ...item, status: "ready" })),
        );
        setStage("published");
      }, 900);

      notify(`Upload queued: ${complete.video.title}`);
      setTimeout(() => {
        setOpen(false);
        onUploaded();
      }, 1200);
    } catch (error) {
      setStage("failed");
      notify(error.message, "error");
    }
  }

  const steps = [
    { key: "uploading", label: "Uploading" },
    { key: "processing", label: "Processing / Transcoding" },
    { key: "thumbnails", label: "Generating Thumbnails" },
    { key: "published", label: "Published / Live" },
  ];
  const currentIndex = Math.max(
    0,
    steps.findIndex((item) => item.key === stage),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UploadCloud size={18} />
          Upload Video
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[min(1080px,calc(100vw-32px))]">
        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-display text-[var(--admin-foreground)]">
              Upload Video
            </DialogTitle>
            <DialogDescription>
              S3 multipart upload with live upload speed, ETA and transcoding status tracking.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <label
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "grid min-h-64 cursor-pointer place-items-center rounded-[8px] border border-dashed p-6 text-center transition",
                dragging
                  ? "border-[var(--admin-primary)] bg-[var(--admin-soft)]"
                  : "border-[var(--admin-border)]",
              )}
            >
              <input
                type="file"
                accept="video/*"
                className="sr-only"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
              <div>
                <UploadCloud
                  className="mx-auto text-[var(--admin-primary)]"
                  size={38}
                />
                <p className="mt-3 font-semibold">
                  {file ? file.name : "Drop video file here"}
                </p>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">
                  Supports large files using 10MB S3 multipart chunks.
                </p>
              </div>
            </label>

            {stage !== "idle" ? (
              <div className="mt-5 rounded-[8px] border border-[var(--admin-border)] p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-semibold">Upload progress</span>
                  <span className="text-[var(--admin-muted)]">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--admin-soft)]">
                  <div
                    className="h-full rounded-full bg-[var(--admin-primary)] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-[var(--admin-muted)]">
                  <span>{speed || "Preparing upload"}</span>
                  <span>{eta}</span>
                </div>
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              {steps.map((step, index) => {
                const complete = stage === "published" || index < currentIndex;
                const active =
                  index === currentIndex &&
                  stage !== "failed" &&
                  stage !== "idle";
                return (
                  <div
                    key={step.key}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-full border",
                        complete
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : active
                            ? "border-[var(--admin-primary)] text-[var(--admin-primary)]"
                            : "border-[var(--admin-border)] text-[var(--admin-muted)]",
                      )}
                    >
                      {complete ? (
                        <Check size={15} />
                      ) : active ? (
                        <Loader2 className="animate-spin" size={15} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={active ? "font-semibold" : ""}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {qualityStatus.map((item) => (
                <div
                  key={item.quality}
                  className="rounded-[8px] border border-[var(--admin-border)] p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{item.quality}</span>
                    <StatusBadge
                      status={
                        item.status === "ready"
                          ? "Live"
                          : item.status === "failed"
                            ? "Failed"
                            : "Processing"
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <label className="text-sm font-semibold">
              Title
              <Input
                required
                className="mt-2"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label className="text-sm font-semibold">
              Description
              <Textarea
                className="mt-2"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Category
                <Select
                  className="mt-2"
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="text-sm font-semibold">
                Pricing
                <Select
                  className="mt-2"
                  value={form.pricing}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      pricing: event.target.value,
                    }))
                  }
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </Select>
              </label>
            </div>
            <label className="text-sm font-semibold">
              Tags
              <Input
                className="mt-2"
                placeholder="thriller, family, telugu"
                value={form.tags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <ImageUploadField
                  label="Thumbnail Artwork"
                  file={thumbnail}
                  onFileChange={setThumbnail}
                  aspectRatio="16/9"
                />
              </div>
              <label className="text-sm font-semibold">
                Scheduled publish date
                <Input
                  className="mt-2"
                  type="datetime-local"
                  value={form.scheduledPublishAt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      scheduledPublishAt: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            {stage === "failed" ? (
              <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                Upload failed. Retry after checking S3 bucket CORS, especially
                `ETag` exposed headers.
              </div>
            ) : null}
          </div>
        </div>
      </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={["uploading", "processing", "thumbnails"].includes(
                stage,
              )}
            >
              {file ? "Start multipart upload" : "Save metadata"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BulkUploadView({ data, loading, notify, refresh }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});

  const categories = data?.categories || [];

  function toggleCategory(catId) {
    setSelectedCategories((current) =>
      current.includes(catId)
        ? current.filter((id) => id !== catId)
        : [...current, catId],
    );
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    const dropped = Array.from(event.dataTransfer.files || []);
    setFiles((current) => [
      ...current,
      ...dropped.filter((f) => f.type.startsWith("video/")),
    ]);
  }

  async function uploadBatch() {
    if (!files.length || !selectedCategories.length) {
      notify("Select files and at least one category", "error");
      return;
    }

    setUploading(true);
    try {
      // Upload files in parallel (4 concurrent uploads)
      const uploadPromises = files.map((file, idx) =>
        uploadFileOptimized(file, idx, files.length),
      );

      await Promise.all(uploadPromises);
      setFiles([]);
      setProgress({});
      setSelectedCategories([]);
      refresh();
      notify(
        `🚀 Batch complete: ${files.length} video(s) in ${selectedCategories.length} categor${selectedCategories.length === 1 ? "y" : "ies"}`,
      );
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function uploadFileOptimized(file, idx, totalFiles) {
    const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
    const MAX_CONCURRENT_PARTS = 4; // Upload 4 parts in parallel

    try {
      setProgress((current) => ({ ...current, [idx]: 0 }));

      // Initiate multipart upload
      const init = await apiFetch("/api/admin/videos/upload", {
        method: "POST",
        body: JSON.stringify({
          action: "initiate",
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
        }),
      });

      const totalParts = Math.ceil(file.size / CHUNK_SIZE);
      const parts = [];

      // Split into batches of concurrent parts
      for (
        let batchStart = 1;
        batchStart <= totalParts;
        batchStart += MAX_CONCURRENT_PARTS
      ) {
        const batchEnd = Math.min(
          batchStart + MAX_CONCURRENT_PARTS - 1,
          totalParts,
        );
        const batchPromises = [];

        for (
          let partNumber = batchStart;
          partNumber <= batchEnd;
          partNumber += 1
        ) {
          batchPromises.push(
            (async () => {
              const start = (partNumber - 1) * CHUNK_SIZE;
              const end = Math.min(start + CHUNK_SIZE, file.size);
              const chunk = file.slice(start, end);

              const signed = await apiFetch("/api/admin/videos/upload", {
                method: "POST",
                body: JSON.stringify({
                  action: "sign-part",
                  key: init.key,
                  uploadId: init.uploadId,
                  partNumber,
                }),
              });

              const uploadResponse = await fetch(signed.url, {
                method: "PUT",
                body: chunk,
              });

              if (!uploadResponse.ok) throw new Error("S3 upload failed");

              parts[partNumber - 1] = {
                PartNumber: partNumber,
                ETag: uploadResponse.headers.get("ETag")?.replaceAll('"', ""),
              };

              const completedParts = parts.filter(Boolean).length;
              const pct = Math.round(
                ((completedParts / totalParts) * 100 + idx * 100) / totalFiles,
              );
              setProgress((current) => ({ ...current, [idx]: pct }));
            })(),
          );
        }

        await Promise.all(batchPromises);
      }

      const selectedCategoryDetails = selectedCategories.map((catId) => {
        const category = categories.find((cat, idx) => {
          const id =
            typeof cat === "string" ? cat : String(cat._id || cat.id || idx);
          return id === catId;
        });

        return {
          id: catId,
          name:
            typeof category === "string"
              ? category
              : category?.name || category?.slug || catId,
        };
      });

      const firstCategory = selectedCategoryDetails[0];

      await apiFetch("/api/admin/videos/upload", {
        method: "POST",
        body: JSON.stringify({
          action: "complete",
          key: init.key,
          uploadId: init.uploadId,
          parts: parts.filter(Boolean),
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          metadata: {
            title: file.name.replace(/\.[^/.]+$/, ""),
            category: firstCategory.name,
            description: "",
            pricing: "free",
          },
        }),
      });

      // Create entries for remaining categories (reference same S3 file)
      if (selectedCategoryDetails.length > 1) {
        for (
          let catIdx = 1;
          catIdx < selectedCategoryDetails.length;
          catIdx += 1
        ) {
          const category = selectedCategoryDetails[catIdx];

          await apiFetch("/api/admin/videos/upload", {
            method: "POST",
            body: JSON.stringify({
              action: "create-content",
              key: init.key,
              uploadId: init.uploadId,
              fileName: file.name,
              fileSize: file.size,
              contentType: file.type,
              metadata: {
                title: file.name.replace(/\.[^/.]+$/, ""),
                category: category.name,
                description: "",
                pricing: "free",
              },
            }),
          });
        }
      }

      notify(
        `✓ ${file.name} → ${selectedCategoryDetails.length} categor${selectedCategoryDetails.length === 1 ? "y" : "ies"}`,
      );
    } catch (error) {
      notify(`✗ ${file.name}: ${error.message}`, "error");
      throw error;
    }
  }

  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload Videos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-3">
                Categories ({selectedCategories.length})
              </label>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-[var(--admin-border)] rounded-[8px] bg-[var(--admin-soft)]"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {categories.length === 0 ? (
                  <p className="text-xs text-[var(--admin-muted)] col-span-full">
                    No categories available
                  </p>
                ) : (
                  categories.map((cat, idx) => {
                    const catId =
                      typeof cat === "string"
                        ? cat
                        : String(cat._id || cat.id || idx);
                    const catName =
                      typeof cat === "string"
                        ? cat
                        : cat.name || cat.slug || cat;
                    return (
                      <label
                        key={catId}
                        className="flex items-center gap-2 cursor-pointer hover:bg-[var(--admin-border)] p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(catId)}
                          onChange={() => toggleCategory(catId)}
                          className="rounded"
                        />
                        <span className="text-sm">{catName}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Files ({files.length})
              </label>
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-[var(--admin-border)] rounded-[8px] cursor-pointer hover:bg-[var(--admin-soft)]">
                <Plus size={18} />
                <span>Add files</span>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    setFiles((current) => [...current, ...newFiles]);
                  }}
                />
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <div
              className="rounded-[8px] border border-[var(--admin-border)] p-4 max-h-96 overflow-y-auto"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <div className="space-y-3">
                {files.map((file, idx) => (
                  <div
                    key={`${idx}-${file.name}`}
                    className="rounded bg-[var(--admin-soft)] p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFiles((current) =>
                            current.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    {progress[idx] !== undefined && (
                      <div className="h-1.5 rounded-full bg-[var(--admin-border)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--admin-primary)] transition-all"
                          style={{ width: `${progress[idx]}%` }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-[var(--admin-muted)] mt-1">
                      {(file.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                      {progress[idx] ?? 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={uploading || !files.length}
            >
              Clear files
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedCategories([])}
              disabled={uploading || !selectedCategories.length}
            >
              Clear categories
            </Button>
            <Button
              onClick={uploadBatch}
              disabled={
                uploading || !files.length || !selectedCategories.length
              }
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={17} />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={17} />
                  Upload to {selectedCategories.length} categor
                  {selectedCategories.length === 1 ? "y" : "ies"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}

function VideosView({
  data,
  loading,
  filters,
  setFilters,
  setPage,
  refresh,
  notify,
}) {
  const [selected, setSelected] = useState([]);
  const videos = data?.videos || [];

  async function bulkDelete() {
    if (!selected.length || !confirm(`Delete ${selected.length} video(s)?`))
      return;
    await apiFetch("/api/admin/videos", {
      method: "DELETE",
      body: JSON.stringify({ ids: selected }),
    });
    setSelected([]);
    notify("Selected videos deleted");
    refresh();
  }

  return (
    <PageShell>
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid gap-2 md:grid-cols-4">
          <Input
            placeholder="Search videos"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                search: event.target.value,
              }))
            }
          />
          <Select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                status: event.target.value,
              }))
            }
          >
            <option value="">All statuses</option>
            {(data?.filters?.statuses || ["Processing", "Live", "Failed"]).map(
              (status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ),
            )}
          </Select>
          <Select
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                page: 1,
                category: event.target.value,
              }))
            }
          >
            <option value="">All categories</option>
            {(data?.filters?.categories || []).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={filters.date || ""}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                date: event.target.value,
              }))
            }
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!selected.length}
            onClick={bulkDelete}
          >
            <Trash2 size={17} />
            Delete
          </Button>
          <UploadModal
            onUploaded={refresh}
            notify={notify}
            categories={data?.filters?.categories || []}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <PinkLoader className="min-h-96" />
          ) : videos.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                      <th className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selected.length === videos.length}
                          onChange={(event) =>
                            setSelected(
                              event.target.checked
                                ? videos.map((video) => video.id)
                                : [],
                            )
                          }
                          aria-label="Select all videos"
                        />
                      </th>
                      {[
                        "Video title",
                        "Duration",
                        "Category",
                        "Status",
                        "Upload date",
                        "Views",
                        "Actions",
                      ].map((head) => (
                        <th key={head} className="px-3 py-3">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((video) => (
                      <tr
                        key={video.id}
                        className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-soft)]"
                      >
                        <td className="px-3 py-4">
                          <input
                            type="checkbox"
                            checked={selected.includes(video.id)}
                            onChange={(event) =>
                              setSelected((current) =>
                                event.target.checked
                                  ? [...current, video.id]
                                  : current.filter((id) => id !== video.id),
                              )
                            }
                            aria-label={`Select ${video.title}`}
                          />
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[var(--admin-soft)]">
                              {video.thumbnailUrl ? (
                                <img
                                  src={video.thumbnailUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <PlayCircle
                                  className="text-[var(--admin-primary)]"
                                  size={22}
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/admin/videos/${video.id}`}
                                className="font-semibold hover:text-[var(--admin-primary)]"
                              >
                                {video.title}
                              </Link>
                              <p className="truncate text-xs text-[var(--admin-muted)]">
                                {video.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          {video.duration
                            ? `${Math.round(video.duration / 60)}m`
                            : "-"}
                        </td>
                        <td className="px-3 py-4">{video.category}</td>
                        <td className="px-3 py-4">
                          <StatusBadge status={video.status} />
                        </td>
                        <td className="px-3 py-4">
                          {formatDate(video.uploadDate)}
                        </td>
                        <td className="px-3 py-4">
                          {numberFormat.format(video.views)}
                        </td>
                        <td className="px-3 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${video.title}`}
                              >
                                <MoreHorizontal size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/videos/${video.id}`}>
                                  <Pencil size={16} />
                                  Edit details
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={data.pagination} setPage={setPage} />
            </>
          ) : (
            <EmptyState
              icon={FileVideo}
              title="No videos match these filters"
              description="Upload a video or clear the current filters to see your library."
            />
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function VideoDetailView({ data, loading, videoId, notify }) {
  const router = useRouter();
  const [form, setForm] = useState(data?.video || null);
  const [pipeline, setPipeline] = useState(null);

  useEffect(() => {
    setForm(data?.video || null);
  }, [data?.video]);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    async function loadStatus() {
      try {
        const payload = await apiFetch(`/api/admin/videos/${videoId}/status`);
        if (!cancelled) setPipeline(payload.pipeline);
      } catch {
        if (!cancelled) setPipeline(null);
      }
    }
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [videoId]);

  async function save() {
    await apiFetch(`/api/admin/videos/${videoId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...form,
        genres: Array.isArray(form.genres)
          ? form.genres
          : String(form.genres || "").split(","),
        tags: Array.isArray(form.tags)
          ? form.tags
          : String(form.tags || "").split(","),
      }),
    });
    notify("Video saved");
  }

  async function remove() {
    if (!confirm("Delete this video permanently?")) return;
    await apiFetch(`/api/admin/videos/${videoId}`, { method: "DELETE" });
    notify("Video deleted");
    router.replace("/admin/videos");
  }

  if (loading || !form) {
    if (!loading && !form) {
      return (
        <PageShell>
          <EmptyState
            icon={FileVideo}
            title="Video not found"
            description="This video may have been deleted or the link is no longer valid."
            action={
              <Button asChild>
                <Link href="/admin/videos">Back to videos</Link>
              </Button>
            }
          />
        </PageShell>
      );
    }

    return (
      <PageShell>
        <PinkLoader className="min-h-[70vh]" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Edit metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              value={form.title || ""}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />
            <Textarea
              value={form.description || ""}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                value={(form.genres || []).join(", ")}
                onChange={(event) =>
                  setForm({
                    ...form,
                    genres: event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Genres"
              />
              <Input
                value={(form.tags || []).join(", ")}
                onChange={(event) =>
                  setForm({
                    ...form,
                    tags: event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Tags"
              />
              <Input
                value={form.thumbnailUrl || ""}
                onChange={(event) =>
                  setForm({ ...form, thumbnailUrl: event.target.value })
                }
                placeholder="Thumbnail URL"
              />
              <Select
                value={form.pricing || "free"}
                onChange={(event) =>
                  setForm({ ...form, pricing: event.target.value })
                }
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </Select>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="danger" onClick={remove}>
                <Trash2 size={17} />
                Delete video
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                {form?.videoSource?.key || form?.hlsManifestUrl ? (
                  <Button variant="secondary" asChild>
                    <Link href={`/admin/watch/${videoId}`}>
                      <Eye size={17} />
                      Watch video
                    </Link>
                  </Button>
                ) : null}
                <Button onClick={save}>
                  <Pencil size={17} />
                  Save changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Transcoding status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <StatusBadge
                  status={
                    pipeline?.status === "live"
                      ? "Live"
                      : pipeline?.status === "failed"
                        ? "Failed"
                        : "Processing"
                  }
                />
                <span className="text-sm font-semibold">
                  {pipeline?.progress || 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--admin-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--admin-primary)] transition-all"
                  style={{ width: `${pipeline?.progress || 0}%` }}
                />
              </div>
              <div className="mt-5 space-y-2">
                {(pipeline?.renditions || []).map((item) => (
                  <div
                    key={item.quality}
                    className="flex items-center justify-between rounded-[8px] border border-[var(--admin-border)] p-3"
                  >
                    <span className="font-semibold">{item.quality}</span>
                    <StatusBadge
                      status={
                        item.status === "ready"
                          ? "Live"
                          : item.status === "failed"
                            ? "Failed"
                            : "Processing"
                      }
                    />
                  </div>
                ))}
              </div>
              {pipeline?.error ? (
                <div className="mt-4 rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {pipeline.error}
                  <Button className="mt-3" variant="outline" size="sm">
                    <RefreshCcw size={16} />
                    Retry
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                ["Views", data?.analytics?.views || 0],
                [
                  "Watch time",
                  `${Math.round((data?.analytics?.watchTime || 0) / 60)}m`,
                ],
                ["Completion", `${data?.analytics?.completionRate || 0}%`],
                ["Likes", data?.analytics?.likes || 0],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[8px] bg-[var(--admin-soft)] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold">
                    {value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embed code</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-[8px] bg-[#071217] p-4 text-xs text-cyan-50">
                {`<iframe src="${typeof window !== "undefined" ? window.location.origin : ""}/admin/watch/${videoId}" allowfullscreen></iframe>`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function UsersView({
  data,
  loading,
  filters,
  setFilters,
  setPage,
  refresh,
  notify,
}) {
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function action(id, action, plan) {
    await apiFetch("/api/admin/users", {
      method: "PUT",
      body: JSON.stringify({ id, action, plan }),
    });
    notify("User updated");
    refresh();
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const res = await apiFetch("/api/admin/users", {
        method: "DELETE",
        body: JSON.stringify({ id: userToDelete.id }),
      });
      if (res && res.success === false) {
        notify(res.message || "Failed to delete user", "error");
      } else {
        notify("User deleted successfully");
        setUserToDelete(null);
        refresh();
      }
    } catch (err) {
      notify(err.message || "Failed to delete user", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <PageShell>
      <div className="mb-5 grid gap-2 md:grid-cols-3">
        <Input
          placeholder="Search users"
          value={filters.search}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              page: 1,
              search: event.target.value,
            }))
          }
        />
        <Select
          value={filters.plan}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              page: 1,
              plan: event.target.value,
            }))
          }
        >
          <option value="">All plans</option>
          <option value="Free">Free</option>
          <option value="Premium">Premium</option>
        </Select>
        <Select
          value={filters.status}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              page: 1,
              status: event.target.value,
            }))
          }
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </Select>
      </div>
      <Card>
        <CardContent className="p-5">
          {loading ? (
            <PinkLoader className="min-h-96" />
          ) : (
            <>
              <ResponsiveTable
                columns={[
                  "User",
                  "Plan",
                  "Status",
                  "Joined",
                  "Last active",
                  "Actions",
                ]}
                rows={(data?.users || []).map((user) => [
                  <div key="user" className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--admin-accent)] text-white">
                      {user.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-[var(--admin-muted)]">
                        {user.email}
                      </p>
                    </div>
                  </div>,
                  <Badge
                    key="plan"
                    tone={user.plan === "Premium" ? "pink" : "gray"}
                  >
                    {user.plan}
                  </Badge>,
                  <StatusBadge key="status" status={user.status} />,
                  formatDate(user.joinedAt),
                  formatDate(user.lastActive),
                  <div key="actions" className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        action(
                          user.id,
                          user.status === "Suspended" ? "activate" : "suspend",
                        )
                      }
                    >
                      {user.status === "Suspended" ? "Activate" : "Suspend"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        action(
                          user.id,
                          "change-plan",
                          user.plan === "Premium" ? "Free" : "Premium",
                        )
                      }
                    >
                      Change Plan
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setUserToDelete(user)}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2.5 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>,
                ])}
                empty="No users found"
              />
              <Pagination pagination={data?.pagination} setPage={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete User Confirmation Modal */}
      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && !isDeleting && setUserToDelete(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="shrink-0 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-500/15 text-rose-500">
                <Trash2 size={20} />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-[var(--admin-foreground)]">
                  Delete User Account
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--admin-muted)] mt-0.5">
                  Permanent action. This cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody className="px-6 py-4 space-y-3">
            <p className="text-sm text-[var(--admin-foreground)]">
              Are you sure you want to permanently delete user{" "}
              <strong className="font-semibold text-rose-400">
                {userToDelete?.name}
              </strong>
              ?
            </p>
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/50 p-3 text-xs space-y-1">
              <p className="text-[var(--admin-muted)]">
                Identifier / Email:{" "}
                <span className="font-mono text-[var(--admin-foreground)]">
                  {userToDelete?.email}
                </span>
              </p>
              <p className="text-[var(--admin-muted)]">
                Plan:{" "}
                <span className="font-medium text-[var(--admin-foreground)]">
                  {userToDelete?.plan}
                </span>
              </p>
              <p className="text-[var(--admin-muted)]">
                Status:{" "}
                <span className="font-medium text-[var(--admin-foreground)]">
                  {userToDelete?.status}
                </span>
              </p>
            </div>
            <p className="text-xs text-rose-500/90 leading-relaxed">
              ⚠️ Deleting this user will permanently remove their account, device logins, active subscriptions, and offline download records.
            </p>
          </DialogBody>

          <DialogFooter className="px-6 py-3.5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setUserToDelete(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isDeleting}
              onClick={handleDeleteUser}
              className="text-xs font-semibold gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Delete User</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function PlansView({ data, loading, refresh, notify }) {
  const [activeTab, setActiveTab] = useState("plans");

  return (
    <PageShell>
      <div className="mb-6 flex gap-1 rounded-xl bg-[var(--admin-soft)] p-1 w-fit">
        {[
          { id: "plans", label: "Plans" },
          { id: "banner", label: "Banner" },
          { id: "coupons", label: "Coupons" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-[var(--admin-primary)] text-white shadow"
                : "text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "plans" && (
        <PlansTab
          data={data}
          loading={loading}
          refresh={refresh}
          notify={notify}
        />
      )}
      {activeTab === "banner" && <BannerTab notify={notify} />}
      {activeTab === "coupons" && (
        <CouponsTab plans={data?.plans || []} notify={notify} />
      )}
    </PageShell>
  );
}

function PlansTab({ data, loading, refresh, notify }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const defaultForm = {
    name: "",
    price: "",
    originalPrice: "",
    duration: 30, // Validity in Days
    label: "",
    tagline: "",
    displayOrder: 0,
    autoRenew: true,
  };
  const [form, setForm] = useState(defaultForm);

  function openCreate() {
    setEditingPlan(null);
    setForm(defaultForm);
    setIsOpen(true);
  }

  function openEdit(plan) {
    setEditingPlan(plan);
    setForm({
      name: plan.name || "",
      price: plan.price ?? "",
      originalPrice: plan.originalPrice ?? "",
      duration: plan.duration ?? 30,
      label: plan.label || "",
      tagline: plan.tagline || "",
      displayOrder: plan.displayOrder ?? 0,
      autoRenew: plan.autoRenew ?? true,
    });
    setIsOpen(true);
  }

  async function savePlan(e) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        price: Number(form.price || 0),
        originalPrice: Number(form.originalPrice || form.price || 0),
        duration: Number(form.duration || 30),
        label: form.label || "",
        tagline: form.tagline || "",
        displayOrder: Number(form.displayOrder || 0),
        autoRenew: Boolean(form.autoRenew),
      };
      if (editingPlan) {
        await apiFetch("/api/admin/plans", {
          method: "PUT",
          body: JSON.stringify({
            ...payload,
            id: editingPlan.id || editingPlan._id,
            isActive: editingPlan.isActive ?? true,
          }),
        });
        notify("Plan updated");
      } else {
        await apiFetch("/api/admin/plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify("Plan created");
      }
      setIsOpen(false);
      setForm(defaultForm);
      refresh();
    } catch (err) {
      notify(err.message || "Failed to save plan", "error");
    }
  }

  async function toggle(plan) {
    try {
      await apiFetch("/api/admin/plans", {
        method: "PUT",
        body: JSON.stringify({
          ...plan,
          id: plan.id || plan._id,
          isActive: !plan.isActive,
        }),
      });
      notify("Plan visibility changed");
      refresh();
    } catch (err) {
      notify(err.message || "Failed", "error");
    }
  }

  async function deletePlan(planId) {
    if (!confirm("Delete this plan?")) return;
    try {
      await apiFetch("/api/admin/plans", {
        method: "DELETE",
        body: JSON.stringify({ id: planId }),
      });
      notify("Plan deleted");
      refresh();
    } catch (err) {
      notify(err.message || "Failed", "error");
    }
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--admin-foreground)]">Subscription Plans</h2>
          <p className="text-xs text-[var(--admin-muted)] mt-0.5">
            Manage subscription plans with price and validity days
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="shadow-[0_0_20px_rgba(0,217,255,0.2)]"
        >
          <Plus size={17} />
          Add Plan
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-xl w-[min(640px,calc(100vw-32px))] overflow-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <form onSubmit={savePlan} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader className="shrink-0 px-6 py-4">
              <div>
                <DialogTitle className="text-xl font-bold font-display text-[var(--admin-foreground)]">
                  {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--admin-muted)] mt-0.5">
                  Set plan name, pricing, and validity duration in days.
                </DialogDescription>
              </div>
            </DialogHeader>

            <DialogBody className="space-y-4 px-6 py-5 admin-modal-scroll">
              {/* Admin Subscription Info Reminder Banner */}
              <div className="rounded-xl border border-[var(--admin-primary)]/35 bg-[var(--admin-primary)]/10 p-3.5 text-xs text-[var(--admin-foreground)] space-y-1 shadow-sm">
                <p className="font-bold flex items-center gap-1.5 text-[var(--admin-primary)] text-[12px]">
                  💡 Simple Subscription Rule
                </p>
                <p className="text-[11px] text-[var(--admin-muted)] leading-relaxed">
                  Subscribed users get full access to watch all non-free episodes and can download any episode marked as <strong>Downloadable</strong> for their plan&apos;s validity days.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--admin-foreground)]">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g., 12 Months Premium, 3 Months, 1 Month"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--admin-foreground)]">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="number"
                    placeholder="499"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--admin-muted)]">
                    Original Price (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="999"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--admin-foreground)]">
                    Validity (Days) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    type="number"
                    min="1"
                    placeholder="30, 90, 365"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                  <p className="text-[10px] text-[var(--admin-muted)]">Number of active days user gets</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--admin-muted)]">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                  />
                  <p className="text-[10px] text-[var(--admin-muted)]">Sorting order on user app</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--admin-muted)]">
                    Promotional Badge / Label
                  </label>
                  <Input
                    placeholder="e.g., Best Value, Popular"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--admin-muted)]">
                    Tagline
                  </label>
                  <Input
                    placeholder="e.g., Just ₹42 /month"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/50">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-foreground)]">Auto-renew Subscriptions</p>
                  <p className="text-[11px] text-[var(--admin-muted)]">Recurring billing via Razorpay</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.autoRenew}
                  onClick={() => setForm((p) => ({ ...p, autoRenew: !p.autoRenew }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:ring-offset-2 ${
                    form.autoRenew ? "bg-[var(--admin-primary)]" : "bg-[var(--admin-border)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      form.autoRenew ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="px-5 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-6 text-xs font-semibold shadow-[0_0_20px_rgba(0,217,255,0.25)]"
              >
                {editingPlan ? "Save Changes" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <PinkLoader className="min-h-96" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data?.plans || []).map((plan) => (
            <Card
              key={plan.id || plan._id}
              className={`transition-all ${plan.isActive ? "" : "opacity-60"}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={plan.isActive ? "green" : "gray"}>
                        {plan.isActive ? "Active" : "Hidden"}
                      </Badge>
                      <Badge tone={plan.autoRenew ? "cyan" : "gray"}>
                        {plan.autoRenew ? "Auto-renew" : "One-time"}
                      </Badge>
                      {plan.label && <Badge tone="cyan">{plan.label}</Badge>}
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-semibold">
                      {plan.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--admin-muted)]">
                      {plan.duration || 30} days · Order{" "}
                      {plan.displayOrder ?? 0}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-3xl font-semibold">
                      {inr.format(plan.price || 0)}
                    </p>
                    {plan.originalPrice && plan.originalPrice > plan.price && (
                      <div className="mt-0.5 flex flex-col items-end">
                        <p className="text-sm text-[var(--admin-muted)] line-through">
                          {inr.format(plan.originalPrice)}
                        </p>
                        <span className="mt-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-500">
                          Save {inr.format(plan.originalPrice - plan.price)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {plan.tagline && (
                  <div className="mt-3 flex items-center gap-1.5 text-sm text-emerald-500 font-medium">
                    <Check size={14} />
                    {plan.tagline}
                  </div>
                )}

                {plan.duration > 30 && (
                  <div className="mt-3 rounded-md bg-[var(--admin-soft)] px-2.5 py-1.5 text-xs text-[var(--admin-muted)] flex items-center justify-between">
                    <span>Est. monthly:</span>
                    <span className="font-semibold text-[var(--admin-foreground)]">
                      {inr.format(
                        Math.round(plan.price / (plan.duration / 30)),
                      )}
                      /mo
                    </span>
                  </div>
                )}

                {plan.iconFeatures?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {plan.iconFeatures.map((f, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 rounded-full bg-[var(--admin-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--admin-muted)]"
                      >
                        {f.icon ? (
                          <img
                            src={f.icon}
                            alt=""
                            className="h-3.5 w-3.5 object-contain"
                          />
                        ) : (
                          <span className="text-[var(--admin-primary)]">◗</span>
                        )}
                        {f.label}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-[var(--admin-border)] flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-[var(--admin-muted)]">
                      {plan.subscribers || 0} subscribers
                    </span>
                    <span className="text-[10px] text-[var(--admin-muted)]">
                      Rev:{" "}
                      <span className="font-semibold text-[var(--admin-foreground)]">
                        {inr.format(plan.revenue || 0)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggle(plan)}
                    >
                      {plan.isActive ? "Hide" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(plan)}
                      className="p-2"
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deletePlan(plan.id || plan._id)}
                      className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/10 hover:border-rose-500"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function PlanBenefitsTab({ notify }) {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  const fetchBenefits = async () => {
    try {
      const res = await apiFetch("/api/admin/benefits");
      if (res.success) {
        setBenefits(res.benefits || []);
      }
    } catch (err) {
      notify(err.message || "Failed to load benefits", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  async function handleAddBenefit(e) {
    e.preventDefault();
    if (!name.trim()) return notify("Benefit name is required", "error");
    if (!file) return notify("Benefit icon image is required", "error");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "benefit-icons");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadPayload = await uploadRes.json();
      if (!uploadRes.ok || !uploadPayload.success) {
        throw new Error(uploadPayload.message || "Icon upload failed");
      }

      const iconUrl = uploadPayload.url;

      await apiFetch("/api/admin/benefits", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), icon: iconUrl }),
      });

      notify("Benefit added successfully");
      setName("");
      setFile(null);
      fetchBenefits();
    } catch (err) {
      notify(err.message || "Failed to add benefit", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBenefit(id) {
    if (
      !confirm(
        "Are you sure you want to delete this benefit? It will be removed from all associated plans.",
      )
    )
      return;
    setDeletingId(id);
    try {
      await apiFetch("/api/admin/benefits", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      notify("Benefit deleted");
      fetchBenefits();
    } catch (err) {
      notify(err.message || "Failed to delete benefit", "error");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <PinkLoader className="min-h-96" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg font-bold">
            Add Plan Benefit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddBenefit}
            className="grid gap-6 md:grid-cols-2"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Benefit Name
                </label>
                <Input
                  placeholder="e.g. Ad free, 4K Quality"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full shadow-[0_0_20px_rgba(0,217,255,0.1)]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Benefit...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Benefit
                  </>
                )}
              </Button>
            </div>

            <div>
              <ImageUploadField
                label="Benefit Icon"
                currentUrl={""}
                file={file}
                onFileChange={setFile}
                aspectRatio="1 / 1"
                disabled={saving}
                hintKey="benefit"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg font-bold">
            Plan Benefits ({benefits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {benefits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--admin-muted)]">
              <Sparkles size={36} className="mb-2 opacity-50" />
              <p>No benefits created yet. Use the form above to add some.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {benefits.map((b) => (
                <div
                  key={b._id || b.id}
                  className="group relative flex flex-col items-center justify-center p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] transition hover:border-[var(--admin-primary)]/40 text-center gap-2"
                >
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={deletingId === (b._id || b.id)}
                      onClick={() => handleDeleteBenefit(b._id || b.id)}
                      className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      {deletingId === (b._id || b.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </Button>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[var(--admin-soft)] p-2 flex items-center justify-center">
                    <img
                      src={b.icon}
                      alt={b.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-semibold text-[var(--admin-foreground)] leading-tight">
                    {b.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BannerTab({ notify }) {
  const [form, setForm] = useState({
    bannerImage: "",
    bannerTitle: "",
    bannerSubtitle: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/subscription-page")
      .then((res) =>
        setForm({
          bannerImage: res.page?.bannerImage || "",
          bannerTitle: res.page?.bannerTitle || "",
          bannerSubtitle: res.page?.bannerSubtitle || "",
        }),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/admin/subscription-page", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      notify("Banner saved");
    } catch (err) {
      notify(err.message || "Failed to save banner", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PinkLoader className="min-h-96" />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Banner Image
              </label>
              <UrlFieldUploader
                value={form.bannerImage}
                onChange={(url) => setForm({ ...form, bannerImage: url })}
                placeholder="Banner image URL"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Banner Title
              </label>
              <Input
                placeholder="e.g., Entertainment"
                value={form.bannerTitle}
                onChange={(e) =>
                  setForm({ ...form, bannerTitle: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Banner Subtitle
              </label>
              <Textarea
                placeholder="e.g., Enjoy ad-free short movies, exclusive content & more."
                value={form.bannerSubtitle}
                onChange={(e) =>
                  setForm({ ...form, bannerSubtitle: e.target.value })
                }
                className="min-h-[80px]"
              />
            </div>
            <Button type="submit" disabled={saving}>
              <Pencil size={15} />
              {saving ? "Saving..." : "Save Banner"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden rounded-xl min-h-[160px] bg-[var(--admin-soft)]">
            {form.bannerImage && (
              <img
                src={form.bannerImage}
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
            <div className="relative p-5">
              <p className="text-xl font-bold text-[var(--admin-primary)]">
                {form.bannerTitle || "Banner Title"}
              </p>
              <p className="mt-1 text-sm text-white/80">
                {form.bannerSubtitle || "Your subtitle appears here."}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[var(--admin-primary)] text-sm font-semibold">
                <Crown size={14} /> Premium Members Only
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CouponsTab({ plans, notify }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const defaultCouponForm = {
    code: "",
    type: "flat",
    value: "",
    applicablePlans: [],
    isActive: true,
    expiresAt: "",
    maxUses: "",
  };
  const [form, setForm] = useState(defaultCouponForm);

  function loadCoupons() {
    setLoading(true);
    apiFetch("/api/admin/coupons")
      .then((res) => setCoupons(res.coupons || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    loadCoupons();
  }, []);

  function openCreate() {
    setEditingCoupon(null);
    setForm(defaultCouponForm);
    setIsOpen(true);
  }
  function openEdit(c) {
    setEditingCoupon(c);
    setForm({
      code: c.code || "",
      type: c.type || "flat",
      value: c.value ?? "",
      applicablePlans: c.applicablePlans || [],
      isActive: c.isActive ?? true,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      maxUses: c.maxUses ?? "",
    });
    setIsOpen(true);
  }

  function togglePlan(planId) {
    setForm((p) => {
      const has = p.applicablePlans.includes(planId);
      return {
        ...p,
        applicablePlans: has
          ? p.applicablePlans.filter((id) => id !== planId)
          : [...p.applicablePlans, planId],
      };
    });
  }

  async function saveCoupon(e) {
    e.preventDefault();
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value || 0),
        applicablePlans: form.applicablePlans,
        isActive: form.isActive,
        expiresAt: form.expiresAt || null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
      };
      if (editingCoupon) {
        await apiFetch("/api/admin/coupons", {
          method: "PUT",
          body: JSON.stringify({ ...payload, id: editingCoupon._id }),
        });
        notify("Coupon updated");
      } else {
        await apiFetch("/api/admin/coupons", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify("Coupon created");
      }
      setIsOpen(false);
      loadCoupons();
    } catch (err) {
      notify(err.message || "Failed to save coupon", "error");
    }
  }

  async function deleteCoupon(id) {
    if (!confirm("Delete this coupon?")) return;
    try {
      await apiFetch("/api/admin/coupons", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      notify("Coupon deleted");
      loadCoupons();
    } catch (err) {
      notify(err.message || "Failed", "error");
    }
  }

  async function toggleActive(coupon) {
    try {
      await apiFetch("/api/admin/coupons", {
        method: "PUT",
        body: JSON.stringify({
          ...coupon,
          id: coupon._id,
          isActive: !coupon.isActive,
        }),
      });
      notify("Updated");
      loadCoupons();
    } catch (err) {
      notify(err.message || "Failed", "error");
    }
  }

  const getPlanName = (id) =>
    plans.find((p) => (p._id || p.id) === id)?.name || id;

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-[var(--admin-muted)]">
          Manage discount coupons for subscriptions
        </p>
        <Button
          onClick={openCreate}
          className="shadow-[0_0_20px_rgba(0,217,255,0.2)]"
        >
          <Plus size={17} />
          Add Coupon
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl w-[min(760px,calc(100vw-32px))]">
          <form onSubmit={saveCoupon} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                    {editingCoupon ? "Edit Discount Coupon" : "Create New Coupon"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                    {editingCoupon
                      ? "Update coupon restrictions, discount value, and plan eligibility."
                      : "Create a promotional discount code for user subscriptions."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <DialogBody className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g., FESTIVE50"
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase() })
                    }
                    className="font-mono font-bold tracking-widest text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Discount Type & Value <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex rounded-lg overflow-hidden border border-[var(--admin-border)] shrink-0">
                      {["flat", "percentage"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, type: t })}
                          className={`px-3 py-2 text-xs font-bold transition-colors ${form.type === t ? "bg-[var(--admin-primary)] text-[#031216]" : "bg-[var(--admin-surface)] text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]"}`}
                        >
                          {t === "flat" ? "₹ Flat" : "% Off"}
                        </button>
                      ))}
                    </div>
                    <Input
                      required
                      type="number"
                      min="0"
                      placeholder={form.type === "flat" ? "50" : "20"}
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                      className="font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Expiration Date
                  </label>
                  <Input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) =>
                      setForm({ ...form, expiresAt: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Max Redemptions
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={form.maxUses}
                    onChange={(e) =>
                      setForm({ ...form, maxUses: e.target.value })
                    }
                  />
                </div>
              </div>

              {plans.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Eligible Plans
                    </label>
                    <span className="text-xs text-[var(--admin-muted)]">
                      {form.applicablePlans.length === 0 ? "Applies to all plans" : `${form.applicablePlans.length} plans selected`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/40 p-3.5">
                    {plans.map((plan) => {
                      const planId = plan._id || plan.id;
                      const selected = form.applicablePlans.includes(planId);
                      return (
                        <button
                          key={planId}
                          type="button"
                          onClick={() => togglePlan(planId)}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${selected ? "bg-[var(--admin-primary)] border-[var(--admin-primary)] text-[#031216] shadow-sm" : "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-foreground)] hover:border-[var(--admin-primary)]"}`}
                        >
                          {plan.name}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-[var(--admin-muted)]">
                    Click to toggle. Leave empty to automatically allow across all plans.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between p-3.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/30">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-foreground)]">Coupon Activation Status</p>
                  <p className="text-xs text-[var(--admin-muted)] mt-0.5">When active, users can immediately redeem this promo during checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, isActive: !p.isActive }))
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${form.isActive ? "bg-[var(--admin-primary)]" : "bg-[var(--admin-border)]"}`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCoupon ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <PinkLoader className="min-h-60" />
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-60 text-[var(--admin-muted)]">
          <p className="text-lg font-semibold">No coupons yet</p>
          <p className="text-sm mt-1">
            Click Add Coupon to create your first discount code
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => {
            const expired =
              coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
            const maxed = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
            return (
              <Card
                key={coupon._id}
                className={`transition-all ${!coupon.isActive || expired || maxed ? "opacity-60" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge
                          tone={
                            coupon.isActive && !expired && !maxed
                              ? "green"
                              : "gray"
                          }
                        >
                          {expired
                            ? "Expired"
                            : maxed
                              ? "Maxed"
                              : coupon.isActive
                                ? "Active"
                                : "Inactive"}
                        </Badge>
                        <Badge
                          tone={coupon.type === "percentage" ? "cyan" : "pink"}
                        >
                          {coupon.type === "percentage" ? "%" : "₹"}{" "}
                          {coupon.type}
                        </Badge>
                      </div>
                      <p className="font-mono text-lg font-bold tracking-widest text-[var(--admin-foreground)]">
                        {coupon.code}
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[var(--admin-primary)]">
                        {coupon.type === "flat"
                          ? `₹${coupon.value} off`
                          : `${coupon.value}% off`}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--admin-muted)]">
                        Saved:{" "}
                        <span className="font-semibold text-[var(--admin-foreground)]">
                          {inr.format(coupon.revenueImpact || 0)}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(coupon)}
                        className="p-1.5"
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteCoupon(coupon._id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 border-rose-500/10 hover:border-rose-500"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                  {coupon.applicablePlans?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {coupon.applicablePlans.map((id) => (
                        <span
                          key={id}
                          className="rounded-full bg-[var(--admin-soft)] px-2 py-0.5 text-[11px] text-[var(--admin-muted)]"
                        >
                          {getPlanName(id)}
                        </span>
                      ))}
                    </div>
                  )}
                  {!coupon.applicablePlans?.length && (
                    <p className="mt-2 text-xs text-[var(--admin-muted)]">
                      Applies to all plans
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t border-[var(--admin-border)] flex items-center justify-between text-xs text-[var(--admin-muted)]">
                    <span>
                      Used: {coupon.usedCount || 0}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      {coupon.expiresAt && (
                        <span>
                          {new Date(coupon.expiresAt).toLocaleDateString(
                            "en-IN",
                          )}
                        </span>
                      )}
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={`relative h-4 w-8 rounded-full transition-colors ${coupon.isActive ? "bg-[var(--admin-primary)]" : "bg-[var(--admin-soft)]"}`}
                      >
                        <span
                          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${coupon.isActive ? "translate-x-4" : "translate-x-0.5"}`}
                        />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function UrlFieldUploader({
  value,
  onChange,
  placeholder = "Paste URL",
  disabled = false,
  aspectRatio = "1 / 1",
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Input
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            disabled={disabled}
            aria-label="Clear image URL"
            title="Clear image URL"
            className="text-red-500 hover:bg-red-500/10 hover:text-red-600 shrink-0"
          >
            <X size={16} />
          </Button>
        ) : null}
      </div>
      {value ? (
        <div
          className="relative grid min-h-16 place-items-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-soft)] group"
          style={{ aspectRatio }}
        >
          <img src={value} alt="" className="h-full w-full object-cover" />
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 z-20 h-6 w-6 rounded-full bg-red-600/90 hover:bg-red-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title="Remove image"
              aria-label="Remove image"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function CategoriesView({ data, loading, refresh, notify }) {
  const categories = data?.categories || [];
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    borderColor: "#06b6d4",
    displayOrder: 0,
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || "",
        slug: editing.slug || "",
        description: editing.description || "",
        imageUrl: editing.imageUrl || "",
        borderColor: editing.borderColor || "#06b6d4",
        displayOrder: editing.displayOrder ?? 0,
        isFeatured: Boolean(editing.isFeatured),
        isActive: editing.isActive !== false,
      });
    } else {
      setForm({
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        borderColor: "#06b6d4",
        displayOrder: categories.length + 1,
        isFeatured: false,
        isActive: true,
      });
    }
  }, [editing, isOpen, categories.length]);

  function openCreate() {
    setEditing(null);
    setIsOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        imageUrl: form.imageUrl,
        borderColor: form.borderColor,
        displayOrder: Number(form.displayOrder || 0),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      const response = await fetch("/api/admin/categories", {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          editing ? { ...payload, id: editing.id || editing._id } : payload,
        ),
      });
      const result = await readJsonResponse(response);
      if (!response.ok || !result.success)
        throw new Error(result.message || "Save failed");

      notify(editing ? "Category updated" : "Category created");
      setIsOpen(false);
      setEditing(null);
      refresh();
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category?")) return;
    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await readJsonResponse(response);
      if (!response.ok || !result.success)
        throw new Error(result.message || "Delete failed");
      notify("Category deleted");
      refresh();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <PageShell>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-[var(--admin-muted)]">
          Manage content genres and category metadata
        </p>
        <Button onClick={openCreate}>
          <Plus size={17} /> Add Category
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl w-[min(780px,calc(100vw-32px))]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                {editing ? "Edit Category / Genre" : "Add New Category"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Configure category taxonomy, branding colors, banner imagery, and display priorities.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g., Action & Adventure"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Slug
                  </label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated from name if blank"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Description
                </label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Genre summary or target audience description..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Cover / Header Image URL
                  </label>
                  <UrlFieldUploader
                    value={form.imageUrl}
                    onChange={(url) => setForm({ ...form, imageUrl: url })}
                    placeholder="Category image URL"
                    aspectRatio="16 / 9"
                  />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Theme Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={form.borderColor || "#00d9ff"}
                        onChange={(e) =>
                          setForm({ ...form, borderColor: e.target.value })
                        }
                        className="h-10 w-16 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={form.borderColor}
                        onChange={(e) =>
                          setForm({ ...form, borderColor: e.target.value })
                        }
                        placeholder="#00d9ff"
                        className="font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Display Priority Order
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={form.displayOrder}
                      onChange={(e) =>
                        setForm({ ...form, displayOrder: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-6 p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/30">
                <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                    className="rounded border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)] h-4 w-4"
                  />
                  Featured on Homepage
                </label>
                <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="rounded border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)] h-4 w-4"
                  />
                  Active (Published)
                </label>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <PinkLoader className="min-h-96" />
      ) : categories.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id || category._id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[var(--admin-soft)]">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Layers3
                          size={20}
                          className="text-[var(--admin-primary)]"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-xs text-[var(--admin-muted)]">
                        {category.slug}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={category.isActive ? "Active" : "Suspended"}
                  />
                </div>
                {category.description ? (
                  <p className="mt-3 text-sm text-[var(--admin-muted)]">
                    {category.description}
                  </p>
                ) : null}
                <div className="mt-4 flex items-center justify-between text-xs text-[var(--admin-muted)]">
                  <span>{category.videoCount || 0} items</span>
                  <span>Order {category.displayOrder ?? 0}</span>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(category);
                      setIsOpen(true);
                    }}
                  >
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(category.id || category._id)}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/10 hover:border-rose-500"
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Layers3}
          title="No categories found"
          description="Create a category to organize your catalog."
        />
      )}
    </PageShell>
  );
}

function LanguagesView({ data, loading, refresh, notify }) {
  const languages = data?.languages || [];
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    englishName: "",
    nativeName: "",
    imageUrl: "",
    color: "0xFF00D2FF",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    if (editing) {
      setForm({
        code: editing.code || "",
        englishName: editing.englishName || "",
        nativeName: editing.nativeName || "",
        imageUrl: editing.imageUrl || "",
        color: editing.color || "0xFF00D2FF",
        order: editing.order ?? 0,
        isActive: editing.isActive !== false,
      });
    } else {
      setForm({
        code: "",
        englishName: "",
        nativeName: "",
        imageUrl: "",
        color: "0xFF00D2FF",
        order: languages.length + 1,
        isActive: true,
      });
    }
  }, [editing, isOpen, languages.length]);

  function openCreate() {
    setEditing(null);
    setIsOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        code: form.code.trim().toLowerCase(),
        englishName: form.englishName.trim(),
        nativeName: form.nativeName.trim(),
        imageUrl: form.imageUrl,
        color: form.color,
        order: Number(form.order || 0),
        isActive: form.isActive,
      };

      const response = await fetch("/api/admin/languages", {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          editing ? { ...payload, _id: editing.id || editing._id } : payload,
        ),
      });
      const result = await readJsonResponse(response);
      if (!response.ok || !result.success)
        throw new Error(result.message || "Save failed");

      notify(editing ? "Language updated" : "Language created");
      setIsOpen(false);
      setEditing(null);
      refresh();
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this language?")) return;
    try {
      const response = await fetch("/api/admin/languages", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await readJsonResponse(response);
      if (!response.ok || !result.success)
        throw new Error(result.message || "Delete failed");
      notify("Language deleted");
      refresh();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <PageShell>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-[var(--admin-muted)]">
          Manage languages and content localization availability
        </p>
        <Button onClick={openCreate}>
          <Plus size={17} /> Add Language
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl w-[min(780px,calc(100vw-32px))]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold font-display text-[var(--admin-foreground)]">
                {editing ? "Edit Language" : "Add New Language"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Configure content localization codes, native naming, icons, and theme accents.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Language Code (e.g. en, es, te) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                    disabled={!!editing}
                    placeholder="te"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    English Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.englishName}
                    onChange={(e) => setForm({ ...form, englishName: e.target.value })}
                    required
                    placeholder="Telugu"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Native Script Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.nativeName}
                    onChange={(e) => setForm({ ...form, nativeName: e.target.value })}
                    required
                    placeholder="తెలుగు"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Display Priority Order
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Language Icon / Flag URL
                  </label>
                  <UrlFieldUploader
                    value={form.imageUrl}
                    onChange={(url) => setForm({ ...form, imageUrl: url })}
                    placeholder="Language image URL"
                    aspectRatio="1 / 1"
                  />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Theme Accent Color
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={(() => {
                          const val = form.color || "0xFF00D2FF";
                          if (val.startsWith("0xFF") && val.length === 10)
                            return `#${val.slice(4)}`;
                          if (val.startsWith("#")) return val;
                          return "#00D2FF";
                        })()}
                        onChange={(e) => {
                          const hex = e.target.value;
                          setForm({
                            ...form,
                            color: `0xFF${hex.slice(1).toUpperCase()}`,
                          });
                        }}
                        className="w-14 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        placeholder="e.g. 0xFF00D2FF"
                        className="flex-grow font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 text-sm font-semibold select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="rounded border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)] h-4 w-4"
                      />
                      Active (Show in select fields)
                    </label>
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Language"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <PinkLoader className="min-h-96" />
      ) : languages.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {languages.map((lang) => (
            <Card key={lang.id || lang._id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[var(--admin-soft)]">
                      {lang.imageUrl ? (
                        <img
                          src={lang.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Globe
                          size={24}
                          className="text-[var(--admin-primary)]"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--admin-foreground)]">{lang.englishName}</h3>
                      <p className="text-xs text-[var(--admin-muted)]">
                        {lang.nativeName} ({lang.code})
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                          lang.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"
                        )}>
                          {lang.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-[9px] text-[var(--admin-muted)] font-mono">
                          Order: {lang.order}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[var(--admin-muted)] hover:text-white"
                      onClick={() => {
                        setEditing(lang);
                        setIsOpen(true);
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/5"
                      onClick={() => handleDelete(lang.id || lang._id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Globe}
          title="No languages set"
          description="Click Add Language to start setting up content localization."
        />
      )}
    </PageShell>
  );
}

function AnalyticsView({ data, loading, range, setRange, notify }) {
  const [activeTab, setActiveTab] = useState("engagement");

  return (
    <PageShell>
      <div className="mb-6 flex gap-1 rounded-xl bg-[var(--admin-soft)] p-1 w-fit">
        {[
          { id: "engagement", label: "Engagement Analytics" },
          { id: "subscriptions", label: "Subscription Analytics" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-[var(--admin-primary)] text-white shadow"
                : "text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "engagement" ? (
        <EngagementAnalyticsTab
          data={data}
          loading={loading}
          range={range}
          setRange={setRange}
        />
      ) : (
        <SubscriptionAnalytics notify={notify} />
      )}
    </PageShell>
  );
}

function EngagementAnalyticsTab({ data, loading, range, setRange }) {
  const daily = data?.daily || [];
  const topContent = data?.topContent || [];
  const geography = data?.geography || [];
  const devices = data?.devices || [];

  const summary = [
    {
      label: "Daily Views",
      value: compactNumber(
        daily.reduce((sum, row) => sum + (row.views || 0), 0),
      ),
    },
    {
      label: "Signups",
      value: compactNumber(
        daily.reduce((sum, row) => sum + (row.signups || 0), 0),
      ),
    },
    {
      label: "Revenue",
      value: inr.format(
        daily.reduce((sum, row) => sum + (row.revenue || 0), 0),
      ),
    },
    {
      label: "Watch Time",
      value: compactNumber(
        daily.reduce((sum, row) => sum + (row.watchTime || 0), 0),
      ),
    },
  ];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--admin-muted)]">
          Performance trends across the selected period
        </p>
        <div className="flex rounded-[8px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1">
          {["today", "7d", "30d", "lifetime"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={cn(
                "rounded-[6px] px-3 py-1.5 text-xs font-semibold transition",
                range === option
                  ? "bg-[var(--admin-primary)] text-[#031216]"
                  : "text-[var(--admin-muted)]",
              )}
            >
              {option === "today" ? "Today" : option === "lifetime" ? "Lifetime" : option.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PinkLoader className="min-h-96" />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <Card key={item.label}>
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-wider text-[var(--admin-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Activity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={daily}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--admin-border)"
                      />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="var(--admin-primary)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="signups"
                        stroke="var(--admin-accent)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={devices}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={92}
                        innerRadius={56}
                        paddingAngle={4}
                      >
                        {devices.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Top Content</CardTitle>
              </CardHeader>
              <CardContent>
                {topContent.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="border-b border-[var(--admin-border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                          <th className="px-3 py-3">Title</th>
                          <th className="px-3 py-3">Type</th>
                          <th className="px-3 py-3">Views</th>
                          <th className="px-3 py-3">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topContent.map((item) => (
                          <tr
                            key={item.title}
                            className="border-b border-[var(--admin-border)]"
                          >
                            <td className="px-3 py-3 font-semibold">
                              {item.title}
                            </td>
                            <td className="px-3 py-3 capitalize text-[var(--admin-muted)]">
                              {item.type}
                            </td>
                            <td className="px-3 py-3">
                              {compactNumber(item.views)}
                            </td>
                            <td className="px-3 py-3">
                              {inr.format(item.revenue || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="No top content yet"
                    description="Analytics will populate as viewing activity grows."
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geography</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geography.map((entry) => (
                    <div key={entry.country} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{entry.country}</span>
                        <span className="text-[var(--admin-muted)]">
                          {compactNumber(entry.users)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--admin-soft)]">
                        <div
                          className="h-full rounded-full bg-[var(--admin-primary)]"
                          style={{
                            width: `${Math.min(100, Math.max(8, entry.users))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

function RevenueView({ data, loading, filters, setFilters, setPage }) {
  const summary = data?.summary || {};
  const transactions = data?.transactions || [];

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }

  function exportCsv() {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.method) params.set("method", filters.method);
    params.set("export", "csv");
    window.open(
      `/api/admin/revenue?${params.toString()}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <PageShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--admin-muted)]">
          Track successful transactions and export billing data
        </p>
        <Button type="button" variant="outline" onClick={exportCsv}>
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {loading ? (
        <PinkLoader className="min-h-96" />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Revenue", value: inr.format(summary.total || 0) },
              {
                label: "This Month",
                value: inr.format(summary.thisMonth || 0),
              },
              { label: "Pending", value: inr.format(summary.pending || 0) },
              { label: "Refunds", value: inr.format(summary.refunds || 0) },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-wider text-[var(--admin-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex flex-wrap gap-3">
                <Select
                  value={filters?.status || ""}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className="w-40"
                >
                  <option value="">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </Select>
                <Select
                  value={filters?.method || ""}
                  onChange={(e) => updateFilter("method", e.target.value)}
                  className="w-40"
                >
                  <option value="">All Methods</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="mock">Mock</option>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                      <th className="px-3 py-3">User</th>
                      <th className="px-3 py-3">Plan</th>
                      <th className="px-3 py-3">Amount</th>
                      <th className="px-3 py-3">Method</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr
                        key={txn.id}
                        className="border-b border-[var(--admin-border)]"
                      >
                        <td className="px-3 py-3 font-semibold">{txn.user}</td>
                        <td className="px-3 py-3">{txn.plan}</td>
                        <td className="px-3 py-3">
                          {inr.format(txn.amount || 0)}
                        </td>
                        <td className="px-3 py-3">{txn.paymentMethod}</td>
                        <td className="px-3 py-3 text-[var(--admin-muted)]">
                          {formatDate(txn.date)}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={txn.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <Pagination pagination={data?.pagination} setPage={setPage} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageShell>
  );
}

function NotificationsView({ data, loading, refresh, notify }) {
  const notifications = data?.notifications || [];
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterAudience, setFilterAudience] = useState("all_filter");
  const [filterStatus, setFilterStatus] = useState("all_filter");
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "all",
    status: "scheduled",
    scheduledAt: "",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || "",
        message: editing.message || "",
        audience: editing.audience || "all",
        status: editing.status || "scheduled",
        scheduledAt: editing.scheduledAt
          ? new Date(editing.scheduledAt).toISOString().slice(0, 16)
          : "",
      });
    } else {
      setForm({
        title: "",
        message: "",
        audience: "all",
        status: "scheduled",
        scheduledAt: "",
      });
    }
  }, [editing, isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/notifications", {
        method: editing ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          editing ? { ...form, id: editing.id || editing._id } : form,
        ),
      });
      const result = await readJsonResponse(response);
      if (!response.ok || !result.success)
        throw new Error(result.message || "Save failed");
      
      const countMsg = result.notifiedCount !== undefined ? ` (Sent to ${result.notifiedCount} user(s))` : "";
      notify(editing ? `Notification updated${countMsg}` : `Notification created${countMsg}`);
      setIsOpen(false);
      setEditing(null);
      refresh();
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await showConfirm("Are you sure you want to delete this notification?");
    if (!confirmed) return;
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await readJsonResponse(response);
      if (!response.ok || !result.success)
        throw new Error(result.message || "Delete failed");
      notify("Notification deleted");
      refresh();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  const filteredNotifications = notifications.filter((item) => {
    if (filterAudience !== "all_filter") {
      const aud = item.audience || "all";
      if (filterAudience === "subscribed" && aud !== "subscribed" && aud !== "premium") return false;
      if (filterAudience === "non-subscribed" && aud !== "non-subscribed" && aud !== "free") return false;
      if (filterAudience === "all" && aud !== "all") return false;
    }
    if (filterStatus !== "all_filter" && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchMsg = (item.message || "").toLowerCase().includes(q);
      if (!matchTitle && !matchMsg) return false;
    }
    return true;
  });

  const totalSent = notifications.filter((n) => n.status === "sent").length;
  const totalScheduled = notifications.filter((n) => n.status === "scheduled").length;
  const totalDeliveredCount = notifications.reduce((acc, n) => acc + (n.deliveryCount || 0), 0);

  const getAudienceBadge = (aud) => {
    if (aud === "subscribed" || aud === "premium") {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/20">Subscribed Users</span>;
    }
    if (aud === "non-subscribed" || aud === "free") {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20">Non-Subscribed Users</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/20">All Users</span>;
  };

  return (
    <PageShell>
      {/* Top Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] space-y-1">
          <p className="text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Total Campaigns</p>
          <p className="text-2xl font-bold text-[var(--admin-foreground)]">{notifications.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] space-y-1">
          <p className="text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Sent / Broadcast</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-500">{totalSent}</span>
            <span className="text-xs text-[var(--admin-muted)]">({totalDeliveredCount} total receipts)</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] space-y-1">
          <p className="text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Scheduled</p>
          <p className="text-2xl font-bold text-sky-400">{totalScheduled}</p>
        </div>
      </div>

      {/* Header Controls & Action */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--admin-muted)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="pl-9 text-xs h-9"
            />
          </div>
          <Select
            value={filterAudience}
            onChange={(e) => setFilterAudience(e.target.value)}
            className="w-44 text-xs h-9"
          >
            <option value="all_filter">All Audiences</option>
            <option value="all">All Users</option>
            <option value="subscribed">Subscribed Users</option>
            <option value="non-subscribed">Non-Subscribed Users</option>
          </Select>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-36 text-xs h-9"
          >
            <option value="all_filter">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
          </Select>
        </div>

        <Button
          onClick={() => {
            setEditing(null);
            setIsOpen(true);
          }}
          className="h-9 px-4 text-xs font-semibold bg-[var(--admin-accent)] hover:brightness-95 text-white"
        >
          <Bell size={15} className="mr-1.5" /> Send Notification
        </Button>
      </div>

      {/* Create / Edit Notification Dialog Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-[min(980px,calc(100vw-32px))]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[var(--admin-foreground)]">
                <Bell size={20} className="text-[var(--admin-accent)]" />
                {editing ? "Edit Notification Campaign" : "Create & Broadcast Notification"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Compose announcements and send push notifications to mobile devices.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-5">
              <div className="grid gap-6 md:grid-cols-12">
                {/* Left Column: Input Fields */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. 🔥 New Release: Season 2 Available Now!"
                      required
                      className="text-sm h-10 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Message Body <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Write your push notification message..."
                      rows={4}
                      required
                      className="text-sm"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                        Target Audience
                      </label>
                      <Select
                        value={form.audience}
                        onChange={(e) =>
                          setForm({ ...form, audience: e.target.value })
                        }
                        className="text-sm h-10 bg-[var(--admin-surface)] text-[var(--admin-foreground)]"
                      >
                        <option value="all">All Users</option>
                        <option value="subscribed">Subscribed Users</option>
                        <option value="non-subscribed">Non-Subscribed Users</option>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                        Status / Action
                      </label>
                      <Select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="text-sm h-10 font-medium bg-[var(--admin-surface)] text-[var(--admin-foreground)]"
                      >
                        <option value="sent">Send Now (Instant Broadcast)</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="draft">Draft</option>
                      </Select>
                    </div>
                  </div>

                  {form.status === "scheduled" && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                        Scheduled Date & Time
                      </label>
                      <Input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={(e) =>
                          setForm({ ...form, scheduledAt: e.target.value })
                        }
                        required={form.status === "scheduled"}
                        className="text-sm h-10"
                      />
                    </div>
                  )}
                </div>

                {/* Right Column: Live Mobile Push Notification Preview */}
                <div className="md:col-span-5 bg-[var(--admin-soft)]/30 border border-[var(--admin-border)] rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-2.5 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--admin-muted)] flex items-center gap-1.5">
                        <Smartphone size={13} className="text-[var(--admin-primary)]" /> Mobile Preview
                      </span>
                      {getAudienceBadge(form.audience)}
                    </div>

                    {/* Notification Banner Mockup */}
                    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-3.5 shadow-md space-y-1.5 relative overflow-hidden">
                      <div className="flex items-center justify-between text-[10px] text-[var(--admin-muted)] font-semibold mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--admin-accent)] block animate-pulse" />
                          Chirpii App
                        </span>
                        <span>now</span>
                      </div>
                      <p className="font-bold text-xs text-[var(--admin-foreground)] leading-snug truncate">
                        {form.title || "Notification Title"}
                      </p>
                      <p className="text-[11px] text-[var(--admin-muted)] leading-relaxed line-clamp-3">
                        {form.message || "Push notification message description will appear here..."}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-[var(--admin-muted)] bg-[var(--admin-surface)] p-3 rounded-xl border border-[var(--admin-border)]">
                    {form.status === "sent" ? (
                      <p className="text-emerald-500 font-semibold flex items-center gap-1.5">
                        <Send size={13} className="shrink-0" /> Clicking &quot;Send Now&quot; will immediately push this notice to all matching users.
                      </p>
                    ) : form.status === "scheduled" ? (
                      <p className="text-sky-400 font-semibold flex items-center gap-1.5">
                        <Calendar size={13} className="shrink-0" /> Will automatically broadcast at the specified scheduled time.
                      </p>
                    ) : (
                      <p className="text-amber-500 font-semibold flex items-center gap-1.5">
                        Saved as a draft and will not be sent to users yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-10 text-xs font-semibold px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-10 px-6 text-xs font-bold bg-[var(--admin-accent)] hover:brightness-95 text-white rounded-lg shadow-sm"
              >
                {submitting
                  ? "Processing..."
                  : form.status === "sent"
                  ? "🚀 Send Now (Broadcast)"
                  : "Save Notification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notifications Table */}
      {loading ? (
        <PinkLoader className="min-h-96" />
      ) : filteredNotifications.length ? (
        <Card className="overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-surface)]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-soft)]/40 text-[var(--admin-muted)] font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Notification</th>
                    <th className="px-4 py-3">Audience</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Delivered</th>
                    <th className="px-4 py-3">Scheduled / Sent At</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-border)]">
                  {filteredNotifications.map((item) => (
                    <tr
                      key={item.id || item._id}
                      className="hover:bg-[var(--admin-soft)]/20 transition-colors"
                    >
                      <td className="px-4 py-3.5 max-w-sm">
                        <p className="font-bold text-sm text-[var(--admin-foreground)] leading-tight mb-1">
                          {item.title}
                        </p>
                        <p className="text-xs text-[var(--admin-muted)] line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getAudienceBadge(item.audience)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold">
                        {item.deliveryCount || 0} user(s)
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-[var(--admin-muted)]">
                        {formatDate(item.sentAt || item.scheduledAt || item.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditing(item);
                              setIsOpen(true);
                            }}
                            className="h-8 px-2.5 text-xs"
                          >
                            <Pencil size={13} className="mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id || item._id)}
                            className="h-8 px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/20"
                          >
                            <Trash2 size={13} className="mr-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications found"
          description="Create a notification to send push announcements to users."
        />
      )}
    </PageShell>
  );
}

function SettingsView({ settings, setSettings, notify, master = false }) {
  const [form, setForm] = useState(settings || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings || {});
  }, [settings]);

  function update(path, value) {
    setForm((current) => {
      const next = structuredClone(current || {});
      const segments = path.split(".");
      let target = next;
      while (segments.length > 1) {
        const segment = segments.shift();
        target[segment] = target[segment] || {};
        target = target[segment];
      }
      target[segments[0]] = value;
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await readJsonResponse(response);
      if (!response.ok || !result.success)
        throw new Error(result.message || "Save failed");
      const nextSettings = result.settings || result.data || form;
      setSettings(nextSettings);
      notify(master ? "Master app settings saved" : "Settings saved");
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const safe = {
    platformName: form.platformName || "Chirpii Admin",
    tagline: form.tagline || "",
    logoUrl: form.logoUrl || "",
    faviconUrl: form.faviconUrl || "",
    timezone: form.timezone || "Asia/Kolkata",
    theme: form.theme || {},
    storage: form.storage || {},
    transcoding: form.transcoding || {},
    payments: form.payments || {},
    email: form.email || {},
  };

  return (
    <PageShell>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-[var(--admin-muted)]">
          {master
            ? "Master application branding and infrastructure settings"
            : "Platform configuration and defaults"}
        </p>
        <Button type="button" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Platform Name
              </label>
              <Input
                value={safe.platformName}
                onChange={(e) => update("platformName", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Timezone
              </label>
              <Input
                value={safe.timezone}
                onChange={(e) => update("timezone", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Tagline
              </label>
              <Input
                value={safe.tagline}
                onChange={(e) => update("tagline", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Logo URL
              </label>
              <UrlFieldUploader
                value={safe.logoUrl}
                onChange={(url) => update("logoUrl", url)}
                placeholder="Logo URL"
                aspectRatio="3 / 1"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Favicon URL
              </label>
              <UrlFieldUploader
                value={safe.faviconUrl}
                onChange={(url) => update("faviconUrl", url)}
                placeholder="Favicon URL"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              ["primary", "Primary"],
              ["accent", "Accent"],
              ["warning", "Warning"],
              ["background", "Background"],
              ["surface", "Surface"],
              ["foreground", "Foreground"],
              ["muted", "Muted"],
            ].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  {label}
                </label>
                <Input
                  type="color"
                  value={safe.theme[key] || "#ffffff"}
                  onChange={(e) => update(`theme.${key}`, e.target.value)}
                  className="h-11 p-1"
                />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Radius
              </label>
              <Input
                type="number"
                min="4"
                max="16"
                value={safe.theme.radius || 8}
                onChange={(e) => update("theme.radius", Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage & Transcoding</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Provider
              </label>
              <Input
                value={safe.storage.provider || ""}
                onChange={(e) => update("storage.provider", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Bucket
              </label>
              <Input
                value={safe.storage.bucket || ""}
                onChange={(e) => update("storage.bucket", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Region
              </label>
              <Input
                value={safe.storage.region || ""}
                onChange={(e) => update("storage.region", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                CDN URL
              </label>
              <Input
                value={safe.storage.cdnUrl || ""}
                onChange={(e) => update("storage.cdnUrl", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Raw Prefix
              </label>
              <Input
                value={safe.storage.rawPrefix || ""}
                onChange={(e) => update("storage.rawPrefix", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                HLS Prefix
              </label>
              <Input
                value={safe.storage.hlsPrefix || ""}
                onChange={(e) => update("storage.hlsPrefix", e.target.value)}
              />
            </div>
            <div className="md:col-span-2 grid gap-3 sm:grid-cols-5">
              {[
                ["q360", "360p"],
                ["q480", "480p"],
                ["q720", "720p"],
                ["q1080", "1080p"],
                ["q4k", "4K"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(safe.transcoding.qualities?.[key])}
                    onChange={(e) =>
                      update(`transcoding.qualities.${key}`, e.target.checked)
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Bitrate Preset
              </label>
              <Select
                value={safe.transcoding.bitratePreset || "balanced"}
                onChange={(e) =>
                  update("transcoding.bitratePreset", e.target.value)
                }
              >
                <option value="balanced">Balanced</option>
                <option value="quality">Quality</option>
                <option value="speed">Speed</option>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Worker Mode
              </label>
              <Select
                value={safe.transcoding.workerMode || "ffmpeg-queue"}
                onChange={(e) =>
                  update("transcoding.workerMode", e.target.value)
                }
              >
                <option value="ffmpeg-queue">FFmpeg Queue</option>
                <option value="lambda">Lambda</option>
                <option value="manual">Manual</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments & Email</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Gateway
              </label>
              <Input
                value={safe.payments.gateway || ""}
                onChange={(e) => update("payments.gateway", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Currency
              </label>
              <Input
                value={safe.payments.currency || ""}
                onChange={(e) => update("payments.currency", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Razorpay Key Mask
              </label>
              <Input
                value={safe.payments.razorpayKeyIdMasked || ""}
                onChange={(e) =>
                  update("payments.razorpayKeyIdMasked", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Stripe Key Mask
              </label>
              <Input
                value={safe.payments.stripeKeyMasked || ""}
                onChange={(e) =>
                  update("payments.stripeKeyMasked", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                From Name
              </label>
              <Input
                value={safe.email.fromName || ""}
                onChange={(e) => update("email.fromName", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                From Email
              </label>
              <Input
                value={safe.email.fromEmail || ""}
                onChange={(e) => update("email.fromEmail", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                SMTP Host
              </label>
              <Input
                value={safe.email.smtpHost || ""}
                onChange={(e) => update("email.smtpHost", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                SMTP Port
              </label>
              <Input
                type="number"
                value={safe.email.smtpPort || 587}
                onChange={(e) =>
                  update("email.smtpPort", Number(e.target.value))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </PageShell>
  );
}

export default function AdminApp({
  initialAdmin,
  initialSettings,
  initialDashboardData,
  initialView,
  videoId,
}) {
  const [admin] = useState(initialAdmin);
  const [settings, setSettings] = useState(initialSettings);
  const [darkMode, setDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [data, setData] = useState(
    initialView === "dashboard" ? initialDashboardData : null,
  );
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [videoFilters, setVideoFilters] = useState({
    search: "",
    status: "",
    category: "",
    date: "",
    page: 1,
  });
  const [userFilters, setUserFilters] = useState({
    search: "",
    plan: "",
    status: "",
    page: 1,
  });
  const [subscriberFilters, setSubscriberFilters] = useState({
    search: "",
    planId: "",
    status: "",
    startDate: "",
    endDate: "",
    page: 1,
  });
  const [transactionFilters, setTransactionFilters] = useState({
    search: "",
    planId: "",
    status: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    page: 1,
  });
  const [revenueFilters, setRevenueFilters] = useState({ status: "", page: 1 });
  const [analyticsRange, setAnalyticsRange] = useState("30d");

  const [movieFilters, setMovieFilters] = useState({ search: "", page: 1 });
  const [seriesFilters, setSeriesFilters] = useState({ search: "", page: 1 });
  const [seasonFilters, setSeasonFilters] = useState({ page: 1 });
  const [episodeFilters, setEpisodeFilters] = useState({ page: 1 });
  const [comingSoonFilters, setComingSoonFilters] = useState({ page: 1 });
  const [trailerFilters, setTrailerFilters] = useState({ page: 1 });
  const [bannerFilters, setBannerFilters] = useState({ page: 1 });
  const [trendingFilters, setTrendingFilters] = useState({ page: 1 });
  const [blockbusterFilters, setBlockbusterFilters] = useState({ page: 1 });

  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [selectedSeriesTitle, setSelectedSeriesTitle] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const params = new URLSearchParams(window.location.search);
    const urlSeriesId = params.get("seriesId");
    if (urlSeriesId) {
      setSelectedSeriesId(urlSeriesId);
    } else {
      const storedId = localStorage.getItem("admin_selected_series_id") || "";
      setSelectedSeriesId(storedId);
    }
    const storedTitle =
      localStorage.getItem("admin_selected_series_title") || "";
    setSelectedSeriesTitle(storedTitle);
  }, []);

  // Resolve series slug to ID once series list is loaded
  useEffect(() => {
    const seriesList = data?.series || [];
    if (isMounted && seriesList.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const urlSeriesSlug = params.get("series");
      if (urlSeriesSlug) {
        const found = seriesList.find(s => s.slug === urlSeriesSlug || String(s.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-') === urlSeriesSlug);
        if (found) {
          const foundId = found._id || found.id;
          setSelectedSeriesId(foundId);
          setSelectedSeriesTitle(found.title || "");
        }
      }
    }
  }, [isMounted, data?.series]);

  // Synchronize URL query params with the selected series on Seasons view
  useEffect(() => {
    const seriesList = data?.series || [];
    if (isMounted && initialView === "seasons" && selectedSeriesId && seriesList.length > 0) {
      const found = seriesList.find(s => (s._id || s.id) === selectedSeriesId);
      if (found) {
        const slug = found.slug || String(found.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (slug && typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("series", slug);
          url.searchParams.delete("seriesId");
          window.history.replaceState({}, '', url.pathname + url.search);
        }
      }
    }
  }, [selectedSeriesId, data?.series, isMounted, initialView]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("admin_selected_series_id", selectedSeriesId);
      localStorage.setItem("admin_selected_series_title", selectedSeriesTitle);
    }
  }, [selectedSeriesId, selectedSeriesTitle, isMounted]);

  useEffect(() => {
    applyTheme(settings, darkMode);
  }, [settings, darkMode]);

  useEffect(() => {
    // Silently pre-warm frequent admin menus in the background when browser is idle
    const idleWarm = setTimeout(() => {
      const frequentViews = [
        "series",
        "movies",
        "users",
        "subscribers",
        "plans",
        "categories",
        "languages",
        "banners",
        "notifications",
        "settings",
      ];
      frequentViews.forEach((v, index) => {
        setTimeout(() => {
          prefetchViewData(v);
        }, index * 100);
      });
    }, 1000);
    return () => clearTimeout(idleWarm);
  }, []);

  function handleGlobalSearch(value) {
    setGlobalSearch(value);
    if (initialView === "videos")
      setVideoFilters((c) => ({ ...c, search: value, page: 1 }));
    if (initialView === "users")
      setUserFilters((c) => ({ ...c, search: value, page: 1 }));
    if (initialView === "subscribers")
      setSubscriberFilters((c) => ({ ...c, search: value, page: 1 }));
    if (initialView === "transactions")
      setTransactionFilters((c) => ({ ...c, search: value, page: 1 }));
    if (initialView === "movies")
      setMovieFilters((c) => ({ ...c, search: value, page: 1 }));
    if (initialView === "series")
      setSeriesFilters((c) => ({ ...c, search: value, page: 1 }));
  }

  function notify(message, type = "success") {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: type === "error" ? "error" : "success",
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: "var(--admin-surface, #ffffff)",
      color: "var(--admin-foreground, #0f172a)",
    });
  }

  function dismissToast(id) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  function refresh() {
    apiCache.clear();
    setReloadKey((v) => v + 1);
  }
  function beginRouteLoading(targetView = null) {
    if (targetView) {
      const targetUrl = getViewApiUrl(targetView);
      if (targetUrl && apiCache.has(targetUrl)) {
        return;
      }
    }
    setRouteLoading(true);
  }

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    let url = "/api/admin/dashboard";

    if (
      initialView === "dashboard" &&
      initialDashboardData &&
      reloadKey === 0
    ) {
      setData(initialDashboardData);
      setLoading(false);
      setRouteLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (initialView === "content") {
      setLoading(false);
      setRouteLoading(false);
      return () => {
        cancelled = true;
      };
    }
    if (initialView === "videos") {
      Object.entries(videoFilters).forEach(([k, v]) => {
        if (v && k !== "date") params.set(k, v);
      });
      url = `/api/admin/videos?${params.toString()}`;
    } else if (initialView === "bulk-upload") {
      url = "/api/admin/categories";
    } else if (initialView === "video-detail") {
      url = `/api/admin/videos/${videoId}`;
    } else if (initialView === "users") {
      Object.entries(userFilters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      url = `/api/admin/users?${params.toString()}`;
    } else if (initialView === "subscribers") {
      Object.entries(subscriberFilters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      url = `/api/admin/subscribers?${params.toString()}`;
    } else if (initialView === "plans") {
      url = "/api/admin/plans";
    } else if (initialView === "categories") {
      url = "/api/admin/categories";
    } else if (initialView === "languages") {
      url = "/api/admin/languages";
    } else if (initialView === "analytics") {
      url = `/api/admin/analytics?range=${analyticsRange}`;
    } else if (initialView === "revenue") {
      Object.entries(revenueFilters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      url = `/api/admin/revenue?${params.toString()}`;
    } else if (initialView === "transactions") {
      Object.entries(transactionFilters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      url = `/api/admin/transactions?${params.toString()}`;
    } else if (initialView === "notifications") {
      url = "/api/admin/notifications";
    } else if (
      initialView === "settings" ||
      initialView === "master-app-settings"
    ) {
      url = "/api/admin/settings";
    } else if (initialView === "movies") {
      if (movieFilters.search) params.set("search", movieFilters.search);
      params.set("page", movieFilters.page);
      url = `/api/admin/movies?${params.toString()}`;
    } else if (initialView === "series") {
      if (seriesFilters.search) params.set("search", seriesFilters.search);
      params.set("page", seriesFilters.page);
      url = `/api/admin/series?${params.toString()}`;
    } else if (initialView === "seasons") {
      url = "/api/admin/series?limit=100";
    } else if (initialView === "episodes") {
      url = "/api/admin/series?limit=100";
    } else if (initialView === "bulk-episodes") {
      url = "/api/admin/series?limit=100";
    } else if (initialView === "banners") {
      url = `/api/admin/banners?page=${bannerFilters.page}`;
    } else if (initialView === "coming-soon-admin") {
      url = `/api/admin/coming-soon?page=${comingSoonFilters.page}`;
    } else if (initialView === "trailers-admin") {
      url = `/api/admin/series?limit=200`;
    } else if (initialView === "trending-admin") {
      url = `/api/admin/trending?page=${trendingFilters.page}`;
    } else if (initialView === "blockbusters") {
      url = `/api/admin/blockbusters?page=${blockbusterFilters.page}`;
    } else if (initialView === "cms") {
      url = "/api/admin/cms";
    } else if (initialView === "artists") {
      url = "/api/artists";
    }
    async function load() {
      // Immediate 0ms synchronous render from memory cache
      if (apiCache.has(url)) {
        const cached = apiCache.get(url);
        if (cached) {
          setData(cached.data || cached);
          if (cached.settings) setSettings(cached.settings);
          setLoading(false);
          setRouteLoading(false);
        }
      } else {
        setLoading(true);
      }
      try {
        const payload = await apiFetch(url);
        if (!cancelled) {
          setData(payload.data || payload);
          if (payload.settings) setSettings(payload.settings);
        }
      } catch (err) {
        if (!cancelled) notify(err.message, "error");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRouteLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [
    initialView,
    videoId,
    videoFilters,
    userFilters,
    subscriberFilters,
    transactionFilters,
    revenueFilters,
    analyticsRange,
    movieFilters,
    seriesFilters,
    seasonFilters,
    episodeFilters,
    comingSoonFilters,
    trailerFilters,
    bannerFilters,
    trendingFilters,
    blockbusterFilters,
    reloadKey,
  ]);

  const offsetClass = collapsed ? "lg:pl-[76px]" : "lg:pl-[220px]";
  const title = pageTitles[initialView] || "Admin";

  const activeNavItem = navItems.find((n) => n.view === initialView);
  const isAuthorized =
    !activeNavItem ||
    !activeNavItem.permission ||
    admin?.role === "super_admin" ||
    admin?.permissions?.includes(activeNavItem.permission);

  return (
    <div className="min-h-screen bg-[var(--admin-background)] text-[var(--admin-foreground)]">
      <FetchingBar active={loading || routeLoading} />
      <Sidebar
        activeView={initialView}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        settings={settings}
        admin={admin}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        selectedSeriesId={selectedSeriesId}
        setSelectedSeriesId={setSelectedSeriesId}
        selectedSeriesTitle={selectedSeriesTitle}
        setSelectedSeriesTitle={setSelectedSeriesTitle}
        seriesList={data?.series || []}
        onNavigate={(targetView) => {
          beginRouteLoading(targetView);
          setMobileMenuOpen(false);
        }}
      />
      <MobileNav
        activeView={initialView}
        onNavigate={beginRouteLoading}
        admin={admin}
      />
      <div
        className={cn("min-h-screen transition-all duration-300", offsetClass)}
      >
        <Header
          title={title}
          admin={admin}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          globalSearch={globalSearch}
          setGlobalSearch={handleGlobalSearch}
          setMobileMenuOpen={setMobileMenuOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          selectedSeriesTitle={selectedSeriesTitle}
          activeView={initialView}
        />

        {!isAuthorized ? (
          <PageShell>
            <EmptyState
              icon={Shield}
              title="Access Denied"
              description="You do not have permissions to access this module. Please contact your system administrator."
            />
          </PageShell>
        ) : (
          <>
            {initialView === "dashboard" ? (
              <DashboardView data={data} loading={loading} notify={notify} refresh={refresh} />
            ) : null}
            {initialView === "videos" ? (
              <VideosView
                data={data}
                loading={loading}
                filters={videoFilters}
                setFilters={setVideoFilters}
                setPage={(updater) =>
                  setVideoFilters((c) => ({
                    ...c,
                    page:
                      typeof updater === "function" ? updater(c.page) : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "bulk-upload" ? (
              <BulkUploadView
                data={data}
                loading={loading}
                notify={notify}
                refresh={refresh}
              />
            ) : null}
            {initialView === "video-detail" ? (
              <VideoDetailView
                key={data?.video?.id || videoId || "video-detail"}
                data={data}
                loading={loading}
                videoId={videoId}
                notify={notify}
              />
            ) : null}
            {initialView === "users" ? (
              <UsersView
                data={data}
                loading={loading}
                filters={userFilters}
                setFilters={setUserFilters}
                setPage={(updater) =>
                  setUserFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "subscribers" ? (
              <SubscribersView
                data={data}
                loading={loading}
                filters={subscriberFilters}
                setFilters={setSubscriberFilters}
                setPage={(updater) =>
                  setSubscriberFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "plans" ? (
              <PlansView
                data={data}
                loading={loading}
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "categories" ? (
              <CategoriesView
                data={data}
                loading={loading}
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "languages" ? (
              <LanguagesView
                data={data}
                loading={loading}
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "analytics" ? (
              <AnalyticsView
                data={data}
                loading={loading}
                range={analyticsRange}
                setRange={setAnalyticsRange}
                notify={notify}
              />
            ) : null}
            {initialView === "revenue" ? (
              <RevenueView
                data={data}
                loading={loading}
                filters={revenueFilters}
                setFilters={setRevenueFilters}
                setPage={(updater) =>
                  setRevenueFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
              />
            ) : null}
            {initialView === "transactions" ? (
              <TransactionsView
                data={data}
                loading={loading}
                filters={transactionFilters}
                setFilters={setTransactionFilters}
                setPage={(updater) =>
                  setTransactionFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "notifications" ? (
              <NotificationsView
                data={data}
                loading={loading}
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "settings" ? (
              <SettingsView
                key={settings?.updatedAt || settings?._id || "settings"}
                settings={settings}
                setSettings={setSettings}
                notify={notify}
              />
            ) : null}
            {initialView === "master-app-settings" ? (
              <SettingsView
                key={
                  settings?.updatedAt || settings?._id || "master-app-settings"
                }
                settings={settings}
                setSettings={setSettings}
                notify={notify}
                master
              />
            ) : null}
            {initialView === "movies" ? (
              <MoviesView
                data={data}
                loading={loading}
                filters={movieFilters}
                setFilters={setMovieFilters}
                setPage={(updater) =>
                  setMovieFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "series" ? (
              <SeriesView
                data={data}
                loading={loading}
                filters={seriesFilters}
                setFilters={setSeriesFilters}
                setPage={(updater) =>
                  setSeriesFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "seasons" ? (
              <SeasonsView
                data={data}
                loading={loading}
                refresh={refresh}
                notify={notify}
                selectedSeriesId={selectedSeriesId}
                setSelectedSeriesId={setSelectedSeriesId}
                selectedSeriesTitle={selectedSeriesTitle}
                setSelectedSeriesTitle={setSelectedSeriesTitle}
              />
            ) : null}
            {initialView === "episodes" ? (
              <EpisodesView
                data={data}
                loading={loading}
                refresh={refresh}
                notify={notify}
                selectedSeriesId={selectedSeriesId}
                setSelectedSeriesId={setSelectedSeriesId}
                selectedSeriesTitle={selectedSeriesTitle}
                setSelectedSeriesTitle={setSelectedSeriesTitle}
              />
            ) : null}
            {initialView === "bulk-episodes" ? (
              <BulkEpisodesView
                data={data}
                loading={loading}
                refresh={refresh}
                notify={notify}
                selectedSeriesId={selectedSeriesId}
                setSelectedSeriesId={setSelectedSeriesId}
                selectedSeriesTitle={selectedSeriesTitle}
                setSelectedSeriesTitle={setSelectedSeriesTitle}
              />
            ) : null}
            {initialView === "banners" ? (
              <BannersView
                data={data}
                loading={loading}
                filters={bannerFilters}
                setFilters={setBannerFilters}
                setPage={(updater) =>
                  setBannerFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "featured" ? (
              <PageShell>
                <FeaturedContentView
                  notify={notify}
                  refreshCounter={reloadKey}
                />
              </PageShell>
            ) : null}
            {initialView === "coming-soon-admin" ? (
              <ComingSoonView
                data={data}
                loading={loading}
                filters={comingSoonFilters}
                setFilters={setComingSoonFilters}
                setPage={(updater) =>
                  setComingSoonFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "trailers-admin" ? (
              <TrailersView
                data={data}
                loading={loading}
                filters={trailerFilters}
                setFilters={setTrailerFilters}
                setPage={(updater) =>
                  setTrailerFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
                selectedSeriesId={selectedSeriesId}
                setSelectedSeriesId={setSelectedSeriesId}
                selectedSeriesTitle={selectedSeriesTitle}
                setSelectedSeriesTitle={setSelectedSeriesTitle}
              />
            ) : null}
            {initialView === "trending-admin" ? (
              <TrendingView
                data={data}
                loading={loading}
                filters={trendingFilters}
                setFilters={setTrendingFilters}
                setPage={(updater) =>
                  setTrendingFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "blockbusters" ? (
              <BlockbustersView
                data={data}
                loading={loading}
                filters={blockbusterFilters}
                setFilters={setBlockbusterFilters}
                setPage={(updater) =>
                  setBlockbusterFilters((current) => ({
                    ...current,
                    page:
                      typeof updater === "function"
                        ? updater(current.page)
                        : updater,
                  }))
                }
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "cms" ? (
              <CmsView
                data={data}
                loading={loading}
                refresh={refresh}
                notify={notify}
              />
            ) : null}
            {initialView === "roles" ? (
              <RolesView initialAdmin={admin} notify={notify} />
            ) : null}
            {initialView === "artists" ? (
              <ArtistsView
                data={data}
                loading={loading}
                refresh={refresh}
                notify={notify}
              />
            ) : null}
          </>
        )}
      </div>
      <ToastStack toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}

// ─── ALL available permissions that can be toggled on a role ────────────────
const ALL_PERMISSIONS = [
  { key: "content", label: "Content Hub" },
  { key: "series", label: "Series" },
  { key: "users", label: "Users" },
  { key: "seasons", label: "Seasons" },
  { key: "episodes", label: "Episodes" },
  { key: "bulk-episodes", label: "Bulk Episodes" },
  { key: "trailers", label: "Trailers" },
  { key: "banners", label: "Banners" },
  { key: "coming-soon", label: "Coming Soon" },
  { key: "trending", label: "Trending" },
  { key: "blockbusters", label: "Blockbusters" },
  { key: "plans", label: "Plans" },
  { key: "categories", label: "Genres" },
  { key: "analytics", label: "Analytics" },
  { key: "revenue", label: "Revenue" },
  { key: "notifications", label: "Notifications" },
  { key: "cms", label: "CMS Pages" },
  { key: "roles", label: "Roles & Admins" },
];

const EMPTY_ROLE_FORM = { name: "", description: "", permissions: [] };
const EMPTY_ADMIN_FORM = {
  name: "",
  email: "",
  password: "",
  role: "",
  isActive: true,
};

function RolesView({ initialAdmin, notify }) {
  const [tab, setTab] = useState("roles"); // 'roles' | 'admins'

  // ── Roles state ────────────────────────────────────────────────────────────
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE_FORM);
  const [editingRole, setEditingRole] = useState(null); // null = create
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // ── Sub-admins state ────────────────────────────────────────────────────────
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN_FORM);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  // ── Fetch helpers ───────────────────────────────────────────────────────────
  async function loadRoles() {
    setRolesLoading(true);
    try {
      const payload = await apiFetch("/api/admin/roles");
      setRoles(payload.roles || []);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setRolesLoading(false);
    }
  }

  async function loadAdmins() {
    setAdminsLoading(true);
    try {
      const payload = await apiFetch("/api/admin/sub-admins");
      setAdmins(payload.admins || []);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setAdminsLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);
  useEffect(() => {
    if (tab === "admins") loadAdmins();
  }, [tab]);

  // ── Role CRUD ───────────────────────────────────────────────────────────────
  function openCreateRole() {
    setEditingRole(null);
    setRoleForm(EMPTY_ROLE_FORM);
    setRoleDialogOpen(true);
  }

  function openEditRole(role) {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || "",
      permissions: [...(role.permissions || [])],
    });
    setRoleDialogOpen(true);
  }

  function togglePermission(key) {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  }

  function toggleAllPermissions(selectAll) {
    setRoleForm((prev) => ({
      ...prev,
      permissions: selectAll ? ALL_PERMISSIONS.map((p) => p.key) : [],
    }));
  }

  async function handleRoleSubmit(e) {
    e.preventDefault();
    setRoleSubmitting(true);
    try {
      if (editingRole) {
        await apiFetch(`/api/admin/roles/${editingRole._id}`, {
          method: "PUT",
          body: JSON.stringify(roleForm),
        });
        notify("Role updated successfully");
      } else {
        await apiFetch("/api/admin/roles", {
          method: "POST",
          body: JSON.stringify(roleForm),
        });
        notify("Role created successfully");
      }
      setRoleDialogOpen(false);
      loadRoles();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setRoleSubmitting(false);
    }
  }

  async function handleDeleteRole(role) {
    if (
      !confirm(
        `Delete role "${role.name}"? Sub-admins using this role will lose access.`,
      )
    )
      return;
    try {
      await apiFetch(`/api/admin/roles/${role._id}`, { method: "DELETE" });
      notify("Role deleted");
      loadRoles();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // ── Sub-admin CRUD ─────────────────────────────────────────────────────────
  function openCreateAdmin() {
    setEditingAdmin(null);
    setAdminForm(EMPTY_ADMIN_FORM);
    setAdminDialogOpen(true);
  }

  function openEditAdmin(admin) {
    setEditingAdmin(admin);
    setAdminForm({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role || "",
      isActive: admin.isActive !== false,
    });
    setAdminDialogOpen(true);
  }

  async function handleAdminSubmit(e) {
    e.preventDefault();
    setAdminSubmitting(true);
    try {
      if (editingAdmin) {
        await apiFetch(`/api/admin/sub-admins/${editingAdmin._id}`, {
          method: "PUT",
          body: JSON.stringify(adminForm),
        });
        notify("Sub-admin updated successfully");
      } else {
        await apiFetch("/api/admin/sub-admins", {
          method: "POST",
          body: JSON.stringify(adminForm),
        });
        notify("Sub-admin created successfully");
      }
      setAdminDialogOpen(false);
      loadAdmins();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setAdminSubmitting(false);
    }
  }

  async function handleDeleteAdmin(admin) {
    if (!confirm(`Delete sub-admin "${admin.name}"?`)) return;
    try {
      await apiFetch(`/api/admin/sub-admins/${admin._id}`, {
        method: "DELETE",
      });
      notify("Sub-admin deleted");
      loadAdmins();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  async function handleToggleActive(admin) {
    try {
      await apiFetch(`/api/admin/sub-admins/${admin._id}`, {
        method: "PUT",
        body: JSON.stringify({ ...admin, isActive: !admin.isActive }),
      });
      notify(`Sub-admin ${!admin.isActive ? "activated" : "deactivated"}`);
      loadAdmins();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  const allSelected = roleForm.permissions.length === ALL_PERMISSIONS.length;

  return (
    <PageShell>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--admin-foreground)]">
            Roles &amp; Admin Management
          </h2>
          <p className="text-sm text-[var(--admin-muted)] mt-0.5">
            Create roles, set permissions, and manage sub-admin accounts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("roles")}
            className={cn(
              "flex items-center gap-2 rounded-[8px] px-4 py-2 text-sm font-semibold transition",
              tab === "roles"
                ? "bg-[var(--admin-primary)] text-white shadow-[0_0_18px_rgba(0,217,255,0.3)]"
                : "border border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-soft)]",
            )}
          >
            <Shield size={15} /> Roles
          </button>
          <button
            type="button"
            onClick={() => setTab("admins")}
            className={cn(
              "flex items-center gap-2 rounded-[8px] px-4 py-2 text-sm font-semibold transition",
              tab === "admins"
                ? "bg-[var(--admin-primary)] text-white shadow-[0_0_18px_rgba(0,217,255,0.3)]"
                : "border border-[var(--admin-border)] text-[var(--admin-muted)] hover:bg-[var(--admin-soft)]",
            )}
          >
            <Users size={15} /> Sub-Admins
          </button>
        </div>
      </div>

      {/* ══ ROLES TAB ══════════════════════════════════════════════════════════ */}
      {tab === "roles" && (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={openCreateRole}>
              <Plus size={16} /> Create Role
            </Button>
          </div>

          {rolesLoading ? (
            <PinkLoader className="min-h-64" />
          ) : roles.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No roles yet"
              description="Create a role to assign permissions to sub-admins."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {roles.map((role) => (
                <Card key={role._id} className="relative overflow-hidden">
                  {/* accent strip */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--admin-primary)] to-[var(--admin-accent)]" />
                  <CardHeader className="pb-2 pt-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Shield
                            size={15}
                            className="shrink-0 text-[var(--admin-primary)]"
                          />
                          <span className="truncate capitalize">
                            {role.name}
                          </span>
                        </CardTitle>
                        {role.description && (
                          <p className="mt-1 truncate text-xs text-[var(--admin-muted)]">
                            {role.description}
                          </p>
                        )}
                      </div>
                      {role.name !== "super_admin" && (
                        <div className="flex shrink-0 gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditRole(role)}
                            title="Edit role"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRole(role)}
                            title="Delete role"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {role.name === "super_admin" ? (
                      <div className="flex items-center gap-2 rounded-[6px] bg-[var(--admin-soft)] px-3 py-2 text-xs font-semibold text-[var(--admin-primary)]">
                        <Crown size={13} /> Full access — all permissions
                        granted
                      </div>
                    ) : role.permissions?.length === 0 ? (
                      <p className="text-xs text-[var(--admin-muted)] italic">
                        No permissions assigned yet
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions.map((perm) => (
                          <Badge key={perm} tone="cyan" className="text-[10px]">
                            {ALL_PERMISSIONS.find((p) => p.key === perm)
                              ?.label || perm}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="mt-3 text-[10px] text-[var(--admin-muted)]">
                      {role.permissions?.length ?? "∞"} permission
                      {role.permissions?.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── Role Create/Edit Dialog ───────────────────────────────────── */}
          <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
            <DialogContent className="max-w-3xl w-[min(880px,calc(100vw-32px))]">
              <form onSubmit={handleRoleSubmit} className="flex flex-col h-full max-h-[92vh]">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                    {editingRole ? "Edit Role & Access Permissions" : "Create New Administrative Role"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                    {editingRole
                      ? "Update the role name, description, and module access permissions."
                      : "Define a new role and choose which modules it can access."}
                  </DialogDescription>
                </DialogHeader>

                <DialogBody className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                        Role Identifier <span className="text-red-400">*</span>
                      </label>
                      <Input
                        value={roleForm.name}
                        onChange={(e) =>
                          setRoleForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="e.g. content_editor"
                        required
                        disabled={editingRole?.name === "super_admin"}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                        Description
                      </label>
                      <Input
                        value={roleForm.description}
                        onChange={(e) =>
                          setRoleForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Brief summary of duties and permissions"
                      />
                    </div>
                  </div>

                  {/* Permission grid */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                        Assigned Module Permissions ({roleForm.permissions.length} / {ALL_PERMISSIONS.length})
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleAllPermissions(!allSelected)}
                        className="text-xs font-bold text-[var(--admin-primary)] hover:underline"
                      >
                        {allSelected ? "Deselect All" : "Select All Permissions"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/40 p-4">
                      {ALL_PERMISSIONS.map((perm) => {
                        const active = roleForm.permissions.includes(perm.key);
                        return (
                          <button
                            key={perm.key}
                            type="button"
                            onClick={() => togglePermission(perm.key)}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition text-left",
                              active
                                ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]/15 text-[var(--admin-foreground)] shadow-sm"
                                : "border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-foreground)]",
                            )}
                          >
                            <span
                              className={cn(
                                "grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
                                active
                                  ? "border-[var(--admin-primary)] bg-[var(--admin-primary)] text-[#031216]"
                                  : "border-[var(--admin-border)]",
                              )}
                            >
                              {active && (
                                <Check size={11} className="stroke-[3]" />
                              )}
                            </span>
                            <span className="truncate">{perm.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </DialogBody>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRoleDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={roleSubmitting || !roleForm.name}
                  >
                    {roleSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Saving...
                      </>
                    ) : editingRole ? (
                      "Update Role"
                    ) : (
                      "Create Role"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* ══ SUB-ADMINS TAB ═════════════════════════════════════════════════════ */}
      {tab === "admins" && (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={openCreateAdmin}>
              <Plus size={16} /> Add Sub-Admin
            </Button>
          </div>

          {adminsLoading ? (
            <PinkLoader className="min-h-64" />
          ) : admins.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No sub-admins yet"
              description="Create sub-admin accounts and assign roles to them."
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-[var(--admin-border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                        <th className="px-4 py-3">Admin</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((adminUser) => (
                        <tr
                          key={adminUser._id}
                          className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-soft)]"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-accent)] text-sm font-bold text-white">
                                {adminUser.name?.slice(0, 1)?.toUpperCase() ||
                                  "A"}
                              </div>
                              <span className="font-semibold">
                                {adminUser.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[var(--admin-muted)]">
                            {adminUser.email}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              tone={
                                adminUser.role === "super_admin"
                                  ? "amber"
                                  : "cyan"
                              }
                              className="capitalize"
                            >
                              {adminUser.role?.replace("_", " ") || "No role"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (adminUser.email !== initialAdmin?.email)
                                  handleToggleActive(adminUser);
                              }}
                              disabled={adminUser.email === initialAdmin?.email}
                              title={
                                adminUser.email === initialAdmin?.email
                                  ? "Cannot change your own status"
                                  : "Toggle active status"
                              }
                              className="cursor-pointer disabled:cursor-not-allowed"
                            >
                              <Badge
                                tone={
                                  adminUser.isActive !== false ? "green" : "red"
                                }
                              >
                                {adminUser.isActive !== false
                                  ? "Active"
                                  : "Inactive"}
                              </Badge>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-xs text-[var(--admin-muted)]">
                            {adminUser.createdAt
                              ? formatDate(adminUser.createdAt)
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditAdmin(adminUser)}
                                title="Edit sub-admin"
                              >
                                <Pencil size={14} />
                              </Button>
                              {adminUser.email !== initialAdmin?.email && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteAdmin(adminUser)}
                                  title="Delete sub-admin"
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Sub-admin Create/Edit Dialog ────────────────────────────────── */}
          <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
            <DialogContent className="max-w-xl w-[min(640px,calc(100vw-32px))]">
              <form onSubmit={handleAdminSubmit} className="flex flex-col h-full max-h-[92vh]">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                    {editingAdmin ? "Edit Sub-Admin Account" : "Add Sub-Admin Account"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                    {editingAdmin
                      ? "Update credentials and access role. Leave password blank to retain current."
                      : "Create a new sub-admin user and assign a role to control permissions."}
                  </DialogDescription>
                </DialogHeader>

                <DialogBody className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={adminForm.name}
                      onChange={(e) =>
                        setAdminForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="email"
                      value={adminForm.email}
                      onChange={(e) =>
                        setAdminForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Password{" "}
                      {editingAdmin ? (
                        <span className="font-normal normal-case text-[var(--admin-muted)]">
                          (leave blank to keep current)
                        </span>
                      ) : (
                        <span className="text-red-400">*</span>
                      )}
                    </label>
                    <Input
                      type="password"
                      value={adminForm.password}
                      onChange={(e) =>
                        setAdminForm((p) => ({ ...p, password: e.target.value }))
                      }
                      placeholder={editingAdmin ? "••••••••" : "Min 6 characters"}
                      required={!editingAdmin}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Assigned Role <span className="text-red-400">*</span>
                    </label>
                    {rolesLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Select
                        value={adminForm.role}
                        onChange={(e) =>
                          setAdminForm((p) => ({ ...p, role: e.target.value }))
                        }
                        required
                        className="bg-[var(--admin-surface)] text-[var(--admin-foreground)]"
                      >
                        <option value="">— Select a role —</option>
                        {roles.map((r) => (
                          <option key={r._id} value={r.name}>
                            {r.name} {r.description ? `— ${r.description}` : ""}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                  {editingAdmin && (
                    <div className="flex items-center gap-2.5 pt-2">
                      <input
                        id="admin-active"
                        type="checkbox"
                        checked={adminForm.isActive}
                        onChange={(e) =>
                          setAdminForm((p) => ({
                            ...p,
                            isActive: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 accent-[var(--admin-primary)] cursor-pointer"
                      />
                      <label
                        htmlFor="admin-active"
                        className="text-sm font-semibold cursor-pointer"
                      >
                        Account Active
                      </label>
                    </div>
                  )}
                </DialogBody>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAdminDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={adminSubmitting}>
                    {adminSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Saving...
                      </>
                    ) : editingAdmin ? (
                      "Update Admin"
                    ) : (
                      "Create Admin"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </PageShell>
  );
}

function CmsView({ data, loading, refresh, notify }) {
  const [activeTab, setActiveTab] = useState("privacy");
  const [submitting, setSubmitting] = useState(false);

  const [privacyForm, setPrivacyForm] = useState({
    title: "Privacy Policy",
    content: "",
  });
  const [helpForm, setHelpForm] = useState({
    title: "Help & Support",
    content: "",
    phone: "",
    email: "",
    whatsapp: "",
  });
  const [aboutForm, setAboutForm] = useState({
    title: "About Us",
    content: "",
  });

  useEffect(() => {
    if (data && typeof data === "object") {
      const privacy = data.privacy || data.data?.privacy;
      const help = data.help || data.data?.help;
      const about = data.about || data.data?.about;

      if (privacy) {
        setPrivacyForm({
          title: privacy.title || "Privacy Policy",
          content: privacy.content || "",
        });
      }
      if (help) {
        setHelpForm({
          title: help.title || "Help & Support",
          content: help.content || "",
          phone: help.metadata?.phone || "",
          email: help.metadata?.email || "",
          whatsapp: help.metadata?.whatsapp || "",
        });
      }
      if (about) {
        setAboutForm({
          title: about.title || "About Us",
          content: about.content || "",
        });
      }
    }
  }, [data]);

  async function handleSave(key) {
    setSubmitting(true);
    let payload = { key };
    if (key === "privacy") {
      payload.title = privacyForm.title;
      payload.content = privacyForm.content;
    } else if (key === "help") {
      payload.title = helpForm.title;
      payload.content = helpForm.content;
      payload.metadata = {
        phone: helpForm.phone,
        email: helpForm.email,
        whatsapp: helpForm.whatsapp,
      };
    } else if (key === "about") {
      payload.title = aboutForm.title;
      payload.content = aboutForm.content;
    }

    try {
      const response = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const res = await readJsonResponse(response);
      if (!response.ok || !res.success)
        throw new Error(res.message || "Failed to save");
      notify(`${payload.title || "Page"} saved successfully`);
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <PinkLoader className="min-h-96" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6 flex gap-2 border-b border-[var(--admin-border)] pb-px overflow-x-auto">
        {["privacy", "help", "about"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 px-4 text-sm font-semibold border-b-2 transition capitalize whitespace-nowrap",
              activeTab === tab
                ? "border-[var(--admin-primary)] text-[var(--admin-foreground)] font-bold"
                : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]",
            )}
          >
            {tab === "privacy" && "Privacy Policy"}
            {tab === "help" && "Help & Support"}
            {tab === "about" && "About Us"}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="capitalize">
            {activeTab === "privacy" && "Privacy Policy"}
            {activeTab === "help" && "Help & Support"}
            {activeTab === "about" && "About Us"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Page Title
                </label>
                <Input
                  value={privacyForm.title}
                  onChange={(e) =>
                    setPrivacyForm({ ...privacyForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Content
                </label>
                <Textarea
                  rows={12}
                  value={privacyForm.content}
                  onChange={(e) =>
                    setPrivacyForm({ ...privacyForm, content: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave("privacy")}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Privacy Policy"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "help" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Page Title
                </label>
                <Input
                  value={helpForm.title}
                  onChange={(e) =>
                    setHelpForm({ ...helpForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Introductory Content
                </label>
                <Textarea
                  rows={3}
                  value={helpForm.content}
                  onChange={(e) =>
                    setHelpForm({ ...helpForm, content: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Call Support Phone
                  </label>
                  <Input
                    value={helpForm.phone}
                    onChange={(e) =>
                      setHelpForm({ ...helpForm, phone: e.target.value })
                    }
                    placeholder="+91 9999999999"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Email Support
                  </label>
                  <Input
                    type="email"
                    value={helpForm.email}
                    onChange={(e) =>
                      setHelpForm({ ...helpForm, email: e.target.value })
                    }
                    placeholder="support@chirpii.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    WhatsApp Phone
                  </label>
                  <Input
                    value={helpForm.whatsapp}
                    onChange={(e) =>
                      setHelpForm({ ...helpForm, whatsapp: e.target.value })
                    }
                    placeholder="+91 7777777777"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave("help")}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Help & Support"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Page Title
                </label>
                <Input
                  value={aboutForm.title}
                  onChange={(e) =>
                    setAboutForm({ ...aboutForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Content
                </label>
                <Textarea
                  rows={12}
                  value={aboutForm.content}
                  onChange={(e) =>
                    setAboutForm({ ...aboutForm, content: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave("about")}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save About Us"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function MoviesView({
  data,
  loading,
  filters,
  setFilters,
  setPage,
  refresh,
  notify,
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    releaseYear: new Date().getFullYear(),
    duration: "",
    genres: "",
    language: "",
    pricing: "free",
    isTrending: false,
    isBlockbuster: false,
    isFeatured: false,
    isActive: true,
  });
  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const movies = data?.movies || [];

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || "",
        description: editing.description || "",
        releaseYear: editing.releaseYear || new Date().getFullYear(),
        duration: editing.duration || "",
        genres: Array.isArray(editing.genres) ? editing.genres.join(", ") : "",
        language: Array.isArray(editing.language)
          ? editing.language.join(", ")
          : "",
        pricing: editing.pricing || "free",
        isTrending: editing.isTrending || false,
        isBlockbuster: editing.isBlockbuster || false,
        isFeatured: editing.isFeatured || false,
        isActive: editing.isActive !== false,
      });
    } else {
      setForm({
        title: "",
        description: "",
        releaseYear: new Date().getFullYear(),
        duration: "",
        genres: "",
        language: "",
        pricing: "free",
        isTrending: false,
        isBlockbuster: false,
        isFeatured: false,
        isActive: true,
      });
    }
    setPosterFile(null);
    setBannerFile(null);
    setVideoFile(null);
  }, [editing, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) return notify("Title is required", "error");
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        // Booleans must be explicit strings so server-side toBoolean() works reliably
        if (typeof val === "boolean") {
          fd.append(key, val ? "true" : "false");
        } else if (val !== undefined && val !== null) {
          fd.append(key, val);
        }
      });
      if (posterFile) fd.append("posterImage", posterFile);
      if (bannerFile) fd.append("bannerImage", bannerFile);
      if (videoFile) fd.append("videoFile", videoFile);

      const url = editing
        ? `/api/admin/movies/${editing._id || editing.id}`
        : "/api/admin/movies";
      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, { method, body: fd });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Saving failed");

      notify(editing ? "Movie updated" : "Movie created");
      setOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await showConfirm("Are you sure you want to delete this movie?");
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/admin/movies/${id}`, {
        method: "DELETE",
      });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Deletion failed");
      notify("Movie deleted");
      refresh();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <PageShell>
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-2">
          <Input
            placeholder="Search movies..."
            value={filters.search}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                search: e.target.value,
                page: 1,
              }))
            }
            className="w-64"
          />
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={17} /> Add Movie
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[min(1100px,calc(100vw-32px))]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                {editing ? "Edit Movie Metadata & Media" : "Add New Movie"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Configure movie details, duration, poster/banner artwork, category tags, and stream source.
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Title
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      title: newTitle,
                      slug: slugify(newTitle),
                    }));
                  }}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Release Year
                </label>
                <Input
                  type="number"
                  value={form.releaseYear}
                  onChange={(e) =>
                    setForm({ ...form, releaseYear: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Duration (seconds)
                </label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  placeholder="e.g. 7200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Genres (comma separated)
                </label>
                <Input
                  value={form.genres}
                  onChange={(e) => setForm({ ...form, genres: e.target.value })}
                  placeholder="Action, Drama"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Languages (comma separated)
                </label>
                <Input
                  value={form.language}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value })
                  }
                  placeholder="Hindi, English"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Pricing
                </label>
                <Select
                  value={form.pricing}
                  onChange={(e) =>
                    setForm({ ...form, pricing: e.target.value })
                  }
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </Select>
              </div>
              <ImageUploadField
                label="Poster Image"
                currentUrl={editing?.posterUrl}
                file={posterFile}
                onFileChange={setPosterFile}
                aspectRatio="2/3"
                disabled={submitting}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploadField
                label="Banner Image"
                currentUrl={editing?.bannerUrl}
                file={bannerFile}
                onFileChange={setBannerFile}
                aspectRatio="16/9"
                disabled={submitting}
              />
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Video File (Raw)
                </label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                />
                {editing?.videoUrl && (
                  <p className="text-xs text-[var(--admin-muted)] mt-1">
                    Current: {editing.videoUrl}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.isTrending}
                  onChange={(e) =>
                    setForm({ ...form, isTrending: e.target.checked })
                  }
                />
                Trending
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.isBlockbuster}
                  onChange={(e) =>
                    setForm({ ...form, isBlockbuster: e.target.checked })
                  }
                />
                Blockbuster
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm({ ...form, isFeatured: e.target.checked })
                  }
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Active
              </label>
            </div>
          </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Movie"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Movies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <PinkLoader className="min-h-96" />
          ) : movies.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                      <th className="px-3 py-3">Movie title</th>
                      <th className="px-3 py-3">Year</th>
                      <th className="px-3 py-3">Duration</th>
                      <th className="px-3 py-3">Pricing</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((movie) => (
                      <tr
                        key={movie._id || movie.id}
                        className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-soft)]"
                      >
                        <td className="px-3 py-4 font-semibold flex items-center gap-3">
                          <div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[var(--admin-soft)]">
                            {movie.posterUrl || movie.thumbnailUrl ? (
                              <img
                                src={movie.posterUrl || movie.thumbnailUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Film
                                className="text-[var(--admin-primary)]"
                                size={20}
                              />
                            )}
                          </div>
                          <div>
                            <p>{movie.title}</p>
                            <p className="text-xs text-[var(--admin-muted)]">
                              {(movie.genres || []).join(", ")}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          {movie.releaseYear || "-"}
                        </td>
                        <td className="px-3 py-4">
                          {movie.duration
                            ? `${Math.round(movie.duration / 60)}m`
                            : "-"}
                        </td>
                        <td className="px-3 py-4 capitalize">
                          {movie.pricing || "free"}
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge
                            status={movie.isActive ? "Active" : "Suspended"}
                          />
                        </td>
                        <td className="px-3 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setEditing(movie);
                                  setOpen(true);
                                }}
                              >
                                <Pencil size={16} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleDelete(movie._id || movie.id)
                                }
                              >
                                <Trash2 size={16} className="text-red-500" />{" "}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={data?.pagination} setPage={setPage} />
            </>
          ) : (
            <EmptyState
              icon={Film}
              title="No movies found"
              description="Get started by adding a movie to your library."
            />
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function CastMemberRow({ member, onChange, onRemove, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadToS3(file, "cast", (p) => setProgress(p));
      onChange({ ...member, imageUrl: res.url });
    } catch (err) {
      alert(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--admin-soft)] border border-[var(--admin-border)] rounded-[var(--radius-sm)] relative group">
      <div className="relative w-14 h-14 shrink-0">
        <div className="w-full h-full rounded-full border border-[var(--admin-border)] overflow-hidden bg-slate-200 dark:bg-slate-800 relative flex items-center justify-center">
          {member.imageUrl ? (
            <img
              src={member.imageUrl}
              alt={member.name || "Cast"}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="text-slate-400" size={24} />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-[10px] text-white">
              <span>{progress}%</span>
            </div>
          )}
        </div>
        {member.imageUrl && !uploading && (
          <button
            type="button"
            onClick={() => onChange({ ...member, imageUrl: "" })}
            className="absolute -top-1 -right-1 z-20 h-5 w-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            title="Remove photo"
            aria-label="Remove photo"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 flex-grow">
        <div>
          <label className="text-[10px] uppercase font-bold text-[var(--admin-muted)]">
            Role
          </label>
          <Input
            value={member.role || ""}
            onChange={(e) => onChange({ ...member, role: e.target.value })}
            placeholder="e.g. Hero"
            className="h-8 text-xs"
            disabled={disabled || uploading}
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-[var(--admin-muted)]">
            Name
          </label>
          <Input
            value={member.name || ""}
            onChange={(e) => onChange({ ...member, name: e.target.value })}
            placeholder="e.g. ALLUARJUN"
            className="h-8 text-xs"
            disabled={disabled || uploading}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 justify-center">
        <label className="cursor-pointer bg-[var(--admin-surface)] hover:bg-[var(--admin-soft)] border border-[var(--admin-border)] text-[10px] font-semibold px-2 py-1 rounded text-center block whitespace-nowrap">
          {member.imageUrl ? "Change" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            disabled={disabled || uploading}
          />
        </label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          disabled={disabled || uploading}
          title="Delete cast member"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

const SeriesSkeletonGrid = () => (
  <div className="grid-lib">
    {Array.from({ length: 8 }).map((_, idx) => (
      <div key={idx} className="card-lib animate-pulse border-[var(--admin-border)]">
        <div className="card-media-lib bg-slate-200 dark:bg-zinc-800" />
        <div className="card-body-lib space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-16" />
            <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-16" />
            <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-16" />
          </div>
          <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-5/6" />
          <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded w-full" />
        </div>
      </div>
    ))}
  </div>
);

const SeasonsSkeletonGrid = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div key={idx} className="flex flex-col bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] overflow-hidden shadow-sm animate-pulse">
        <div className="aspect-[2/3] bg-slate-200 dark:bg-zinc-800" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
          <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded w-full" />
        </div>
      </div>
    ))}
  </div>
);

const EpisodesSkeletonGrid = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, idx) => (
      <div key={idx} className="flex flex-col bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] overflow-hidden shadow-sm animate-pulse">
        <div className="aspect-video bg-slate-200 dark:bg-zinc-800" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
          <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded w-full" />
        </div>
      </div>
    ))}
  </div>
);

function ComingSoonModal({ isOpen, onClose, title, initialDate, onSave }) {
  const [dateStr, setDateStr] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDateStr(initialDate ? toLocalDatetimeString(initialDate) : "");
      setErrorMsg("");
    }
  }, [isOpen, initialDate]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!dateStr) {
      setErrorMsg("Please select a date and time");
      return;
    }
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      setErrorMsg("Invalid date & time format");
      return;
    }
    onSave(dateObj.toISOString());
  };

  const handleDateChange = (val) => {
    setDateStr(val);
    if (val) {
      const dateObj = new Date(val);
      if (!isNaN(dateObj.getTime()) && dateObj.getTime() < Date.now()) {
        setErrorMsg("Warning: Chosen date/time is in the past (allowed for testing)");
      } else {
        setErrorMsg("");
      }
    } else {
      setErrorMsg("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-[min(540px,calc(100vw-32px))]">
        <form onSubmit={handleSave} className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
              {title || "Schedule / Coming Soon"}
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
              Select the expected broadcast or release timestamp for this title.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                Release Date & Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => handleDateChange(e.target.value)}
                className="text-sm h-11"
              />
              {errorMsg && (
                <p className={`text-xs mt-1.5 font-medium ${errorMsg.startsWith("Warning") ? "text-amber-400" : "text-rose-400"}`}>
                  {errorMsg}
                </p>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!dateStr}
            >
              Save Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const SeriesCard = React.memo(({
  series,
  nowTime,
  onToggleFlag,
  onPrefetch,
  onEdit,
  onDelete,
  router,
}) => {
  const sid = series._id || series.id;

  // Status label configuration
  let statusClass = "coming";
  let statusText = "Coming soon";
  if (series.isActive === false) {
    statusClass = "draft";
    statusText = "Draft";
  } else if (!series.isComingSoon) {
    statusClass = "published";
    statusText = "Published";
  }

  const langs = Array.isArray(series.language)
    ? series.language
    : typeof series.language === "string" && series.language
      ? series.language
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean)
      : [];
  const visibleLangs = langs.slice(0, 3);
  const extraLangs = langs.length > 3 ? langs.length - 3 : 0;
  const coverUrl =
    series.posterUrl || series.thumbnailUrl || series.bannerUrl;
  const totalSeasons =
    series.totalSeasons ?? series.seasonCount ?? 0;
  const totalEpisodes =
    series.totalEpisodes ?? series.episodeCount ?? 0;
  const updatedAt = series.updatedAt
    ? new Date(series.updatedAt)
    : null;
  const daysAgo = updatedAt
    ? Math.floor((nowTime - updatedAt) / 86400000)
    : null;

  // Cast/crew display details
  let directorsText = "";
  let actorsText = "";
  if (
    series.cast &&
    typeof series.cast === "object" &&
    !Array.isArray(series.cast)
  ) {
    if (series.cast.directors && series.cast.directors.length > 0) {
      directorsText = series.cast.directors
        .map((d) => d.name)
        .join(", ");
    }
    if (series.cast.actors && series.cast.actors.length > 0) {
      actorsText = series.cast.actors.map((a) => a.name).join(", ");
    }
  } else if (
    series.cast &&
    Array.isArray(series.cast) &&
    series.cast.length > 0
  ) {
    actorsText = series.cast
      .map((c) => (typeof c === "string" ? c : c.name))
      .join(", ");
  }

  return (
    <div
      className="card-lib cursor-pointer"
      onClick={() => router.push(`/series/${series.slug}`)}
      onMouseEnter={() => onPrefetch(series)}
      onFocus={() => onPrefetch(series)}
    >
      <div className="card-media-lib relative overflow-hidden bg-[#1b1e25]">
        {coverUrl && (
          <img
            src={coverUrl}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-0"
          />
        )}
        <div className="media-top-lib z-10 relative">
          <span className={`status-chip-lib ${statusClass}`}>
            {statusText}
          </span>

          <div
            className="menu-dot-lib"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-full w-full items-center justify-center bg-transparent border-none text-white cursor-pointer focus:outline-none">
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 bg-[var(--admin-surface)] border-[var(--admin-border)]"
              >
                <DropdownMenuItem
                  onSelect={() => onEdit(series)}
                  className="text-xs font-semibold cursor-pointer"
                >
                  <Pencil size={13} className="mr-2" /> Edit Series
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onDelete(sid)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 size={13} className="mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="media-bottom-lib z-10 relative">
          <div className="title">{series.title}</div>
        </div>
      </div>
      <div className="card-body-lib">
        <div className="genre-line-lib truncate">
          {(series.genres || []).join(" • ")}
        </div>

        <div className="meta-row-lib">
          <div className="meta-pill-lib">
            <Tv size={13} />
            {totalSeasons} season{totalSeasons > 1 ? "s" : ""}
          </div>
          <div className="meta-pill-lib">
            <PlayCircle size={13} />
            {totalEpisodes} episodes
          </div>
          <div className="meta-pill-lib">
            <Globe size={13} />
            {langs.length} langs
          </div>
        </div>

        <div className="lang-row-lib">
          {visibleLangs.map((l) => (
            <span key={l} className="lang-tag-lib">
              {l}
            </span>
          ))}
          {extraLangs > 0 && (
            <span className="lang-tag-lib more">+{extraLangs}</span>
          )}
          {langs.length === 0 && (
            <span className="lang-tag-lib more">
              No languages yet
            </span>
          )}
        </div>

        {(directorsText || actorsText) && (
          <div className="credit-block-lib">
            {directorsText && (
              <div className="truncate">
                <span className="label">Dir:</span>{" "}
                <b>{directorsText}</b>
              </div>
            )}
            {actorsText && (
              <div className="truncate">
                <span className="label">Cast:</span>{" "}
                <b>{actorsText}</b>
              </div>
            )}
          </div>
        )}

        <div
          className="toggle-row-lib"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="toggle-item-lib">
            <label className="switch-lib">
              <input
                type="checkbox"
                checked={!!series.isComingSoon}
                onChange={(e) =>
                  onToggleFlag(
                    series,
                    "isComingSoon",
                    e.target.checked,
                  )
                }
              />
              <span className="slider-lib"></span>
            </label>
            <div className="t-label">Soon</div>
          </div>
          <div className="toggle-item-lib">
            <label className="switch-lib">
              <input
                className="trend"
                type="checkbox"
                checked={!!series.isTrending}
                onChange={(e) =>
                  onToggleFlag(
                    series,
                    "isTrending",
                    e.target.checked,
                  )
                }
              />
              <span className="slider-lib"></span>
            </label>
            <div className="t-label">Trending</div>
          </div>
          <div className="toggle-item-lib">
            <label className="switch-lib">
              <input
                className="block"
                type="checkbox"
                checked={!!series.isBlockbuster}
                onChange={(e) =>
                  onToggleFlag(
                    series,
                    "isBlockbuster",
                    e.target.checked,
                  )
                }
              />
              <span className="slider-lib"></span>
            </label>
            <div className="t-label">Blockbuster</div>
          </div>
        </div>

        {series.isComingSoon && series.expectedReleaseDate && (
          <div
            className="mt-2 text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-[#fff0f6] text-[#ec3f6f] border border-[#ec3f6f]/30 flex items-center gap-1.5 self-start"
            onClick={(e) => e.stopPropagation()}
          >
            <Clock size={12} />
            Coming {new Date(series.expectedReleaseDate).toLocaleString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        )}

        <div className="card-foot-lib">
          <div className="updated-lib">
            {daysAgo !== null
              ? daysAgo === 0
                ? "Updated today"
                : daysAgo === 1
                  ? "Updated 1 day ago"
                  : `Updated ${daysAgo} days ago`
              : "Updated recently"}
          </div>
          <Link
            className="manage-link-lib"
            href={`/admin/seasons?series=${series.slug || String(series.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => onPrefetch(series)}
            onFocus={() => onPrefetch(series)}
          >
            Manage series <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.series === next.series &&
    prev.nowTime === next.nowTime
  );
});

function SeriesView({
  data,
  loading,
  filters,
  setFilters,
  setPage,
  refresh,
  notify,
}) {
  const router = useRouter();
  const [localSeriesList, setLocalSeriesList] = useState([]);
  const [comingSoonModal, setComingSoonModal] = useState({
    isOpen: false,
    series: null,
    initialDate: "",
  });
  const pendingRequests = useRef({});

  useEffect(() => {
    setLocalSeriesList(data?.series || []);
  }, [data?.series]);

  const [nowTime] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    color: "0xFF1A1A2E",
    description: "",
    releaseYear: new Date().getFullYear(),
    genres: "",
    language: "",
    pricing: "free",
    freeEpisodeCount: 0,
    ageRating: "",
    cast: { actors: [], directors: [], writers: [] },
    director: "",
    musicDirector: "",
    producer: "",
    trailerUrl: "",
    isTrending: false,
    isBlockbuster: false,
    isFeatured: false,
    isComingSoon: false,
    expectedReleaseDate: "",
    isActive: true,
  });
  const [posterFile, setPosterFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [trailerPosterFile, setTrailerPosterFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [languagesList, setLanguagesList] = useState([]);
  const [genresList, setGenresList] = useState([]);

  // Filter / view states
  const [viewMode, setViewMode] = useState("grid");
  const [genreFilter, setGenreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("recent");

  useEffect(() => {
    fetch("/api/languages")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLanguagesList(data.languages || []);
      })
      .catch(console.error);

    fetch("/api/genres")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGenresList(data.genres || []);
      })
      .catch(console.error);
  }, []);

  const seriesList = localSeriesList;

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || "",
        slug: editing.slug || slugify(editing.title || ""),
        posterUrl: editing.posterUrl || "",
        bannerUrl: editing.bannerUrl || "",
        color: editing.color || "0xFF1A1A2E",
        description: editing.description || "",
        releaseYear: editing.releaseYear || new Date().getFullYear(),
        genres: Array.isArray(editing.genres) ? editing.genres.join(", ") : "",
        language:
          Array.isArray(editing.language) && editing.language.length > 0
            ? editing.language.join(", ")
            : Array.isArray(editing.languages)
              ? editing.languages.join(", ")
              : "",
        pricing: editing.pricing || "free",
        freeEpisodeCount: editing.freeEpisodeCount || 0,
        ageRating: editing.ageRating || "",
        cast:
          editing.cast &&
          typeof editing.cast === "object" &&
          !Array.isArray(editing.cast)
            ? {
                actors: (editing.cast.actors || []).map((a) => ({
                  _id: a.artistId || a._id || a.id || String(Math.random()),
                  name: a.name,
                  photo: a.photo,
                })),
                directors: (editing.cast.directors || []).map((d) => ({
                  _id: d.artistId || d._id || d.id || String(Math.random()),
                  name: d.name,
                  photo: d.photo,
                })),
                writers: (editing.cast.writers || []).map((w) => ({
                  _id: w.artistId || w._id || w.id || String(Math.random()),
                  name: w.name,
                  photo: w.photo,
                })),
              }
            : {
                actors: Array.isArray(editing.cast)
                  ? editing.cast.map((c) => ({
                      _id: c._id || c.id || String(Math.random()),
                      name: typeof c === "string" ? c : c.name || "",
                      photo:
                        typeof c === "object"
                          ? c.imageUrl || c.photo || ""
                          : "",
                    }))
                  : [],
                directors: [],
                writers: [],
              },
        director: Array.isArray(editing.director)
          ? editing.director.join(", ")
          : "",
        musicDirector: Array.isArray(editing.musicDirector)
          ? editing.musicDirector.join(", ")
          : "",
        producer: Array.isArray(editing.producer)
          ? editing.producer.join(", ")
          : "",
        trailerUrl: editing.trailerUrl || "",
        isTrending: editing.isTrending || false,
        isBlockbuster: editing.isBlockbuster || false,
        isFeatured: editing.isFeatured || false,
        isComingSoon: editing.isComingSoon || false,
        expectedReleaseDate: toLocalDatetimeString(editing.expectedReleaseDate),
        isActive: editing.isActive !== false,
      });
    } else {
      setForm({
        title: "",
        slug: "",
        posterUrl: "",
        bannerUrl: "",
        color: "0xFF1A1A2E",
        description: "",
        releaseYear: new Date().getFullYear(),
        genres: "",
        language: "",
        pricing: "free",
        freeEpisodeCount: 0,
        ageRating: "",
        cast: { actors: [], directors: [], writers: [] },
        director: "",
        musicDirector: "",
        producer: "",
        trailerUrl: "",
        isTrending: false,
        isBlockbuster: false,
        isFeatured: false,
        isComingSoon: false,
        expectedReleaseDate: "",
        isActive: true,
      });
    }
    setPosterFile(null);
    setBannerFile(null);
    setTrailerPosterFile(null);
  }, [editing, open]);

  const handleFormFlagChange = (key, val) => {
    setForm({ ...form, [key]: val });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) return notify("Title is required", "error");
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "cast") {
          const castPayload = {
            actors: (val?.actors || []).map((a) => ({
              artistId: a._id || a.artistId,
              name: a.name,
              photo: a.photo,
            })),
            directors: (val?.directors || []).map((d) => ({
              artistId: d._id || d.artistId,
              name: d.name,
              photo: d.photo,
            })),
            writers: (val?.writers || []).map((w) => ({
              artistId: w._id || w.artistId,
              name: w.name,
              photo: w.photo,
            })),
          };
          fd.append(key, JSON.stringify(castPayload));
        } else if (key === "expectedReleaseDate" && val) {
          try {
            fd.append(key, new Date(val).toISOString());
          } catch (e) {
            fd.append(key, val);
          }
        } else {
          fd.append(key, val);
        }
      });
      if (posterFile) fd.append("posterImage", posterFile);
      if (bannerFile) fd.append("bannerImage", bannerFile);
      if (trailerPosterFile) fd.append("trailerPosterImage", trailerPosterFile);

      const url = editing
        ? `/api/admin/series/${editing._id || editing.id}`
        : "/api/admin/series";
      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, { method, body: fd });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Saving failed");

      notify(editing ? "Series updated" : "Series created");
      setOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this series?",
      "This will also softly delete all of its seasons, episodes, banners, and associated references."
    );
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/admin/series/${id}`, {
        method: "DELETE",
      });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Deletion failed");
      notify("Series deleted");
      refresh();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // ── derived values from seriesList ──────────────────────────────────────
  const totalCount = data?.pagination?.total ?? seriesList.length;
  const publishedCount = seriesList.filter(
    (s) => s.isActive !== false && !s.isComingSoon,
  ).length;
  const draftCount = seriesList.filter((s) => s.isActive === false).length;
  const comingSoonCount = seriesList.filter((s) => s.isComingSoon).length;

  const allGenres = [
    ...new Set(seriesList.flatMap((s) => s.genres || [])),
  ].sort();
  const allLangs = [
    ...new Set(
      seriesList.flatMap((s) =>
        Array.isArray(s.language)
          ? s.language
          : typeof s.language === "string" && s.language
            ? s.language.split(",").map((l) => l.trim())
            : [],
      ),
    ),
  ]
    .filter(Boolean)
    .sort();

  const filteredList = seriesList.filter((s) => {
    if (genreFilter !== "all" && !(s.genres || []).includes(genreFilter))
      return false;
    if (
      statusFilter === "published" &&
      (s.isActive === false || s.isComingSoon)
    )
      return false;
    if (statusFilter === "draft" && s.isActive !== false) return false;
    if (statusFilter === "coming_soon" && !s.isComingSoon) return false;
    if (langFilter !== "all") {
      const langs = Array.isArray(s.language)
        ? s.language
        : typeof s.language === "string"
          ? s.language.split(",").map((l) => l.trim())
          : [];
      if (!langs.includes(langFilter)) return false;
    }
    return true;
  });

  function getStatusStyle(series) {
    if (series.isComingSoon)
      return { label: "Coming Soon", bg: "bg-violet-600", text: "text-white" };
    if (series.isActive === false)
      return { label: "Draft", bg: "bg-amber-500", text: "text-white" };
    return { label: "Published", bg: "bg-emerald-500", text: "text-white" };
  }

  const updateLocalFlag = (sid, flagKey, newVal, dateValue = undefined) => {
    setLocalSeriesList((prev) =>
      prev.map((s) => {
        if ((s._id || s.id) === sid) {
          const updated = { ...s, [flagKey]: newVal };
          if (dateValue !== undefined) {
            updated.expectedReleaseDate = dateValue;
          }
          return updated;
        }
        return s;
      })
    );
  };

  async function handleToggleFlag(series, flagKey, newVal, dateValue = undefined) {
    const sid = series._id || series.id;
    const requestKey = `${sid}_${flagKey}`;

    if (pendingRequests.current[requestKey]) return;

    if (flagKey === "isComingSoon" && newVal === true && !dateValue) {
      setComingSoonModal({
        isOpen: true,
        series,
        initialDate: series.expectedReleaseDate,
      });
      return;
    }

    const originalVal = series[flagKey];
    const originalDate = series.expectedReleaseDate;

    updateLocalFlag(sid, flagKey, newVal, dateValue);

    pendingRequests.current[requestKey] = true;
    try {
      const payload = { [flagKey]: newVal };
      if (flagKey === "isComingSoon") {
        payload.expectedReleaseDate = dateValue || null;
      }

      const response = await fetch(`/api/admin/content/${sid}/flags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const payloadData = await readJsonResponse(response);
      if (!response.ok || !payloadData.success) {
        throw new Error(payloadData.message || "Failed to update flag");
      }

      const updates = { [flagKey]: newVal };
      if (flagKey === "isComingSoon") {
        updates.expectedReleaseDate = dateValue || null;
      }
      updateCacheItem(sid, updates);
    } catch (err) {
      updateLocalFlag(sid, flagKey, originalVal, originalDate);
      notify("Couldn't update. Try again.", "error");
    } finally {
      delete pendingRequests.current[requestKey];
    }
  }

  async function handleUpdateReleaseDate(series, newDateStr) {
    if (!newDateStr) return;
    const dateObj = new Date(newDateStr);
    if (isNaN(dateObj.getTime())) {
      notify("Invalid date/time format.", "error");
      return;
    }
    handleToggleFlag(series, "isComingSoon", true, dateObj.toISOString());
  }

  const handlePrefetchSeriesDetail = (series) => {
    const sid = series._id || series.id;
    if (!sid) return;
    const seasonsUrl = `/api/admin/series/${sid}/seasons`;
    apiFetch(seasonsUrl).catch(() => {});
  };

  return (
    <PageShell>
      <div className="series-library-admin">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .series-library-admin {
            --bg-lib: transparent;
            --panel: #ffffff;
            --panel-2: #f8fafc;
            --line: #e2e8f0;
            --line-soft: #f1f5f9;
            --text-lib: #0f172a;
            --text-dim: #475569;
            --text-faint: #64748b;
            --pink: #ec1f6b;
            --pink-soft: #fdf2f8;
            --pink-glow: rgba(236,31,107,.15);
            --green: #10b981;
            --green-soft: #ecfdf5;
            --amber: #f59e0b;
            --amber-soft: #fffbeb;
            --purple: #8b5cf6;
            --purple-soft: #f5f3ff;
            --radius: 16px;
            
            color: var(--text-lib);
          }

          /* header */
          .page-head-lib { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
          .eyebrow-lib { display: flex; align-items: center; gap: 8px; color: var(--text-faint); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 10px; font-weight: 600; }
          .eyebrow-lib .dot-lib { width: 4px; height: 4px; border-radius: 50%; background: var(--text-faint); }
          .title-lib { font-size: 30px; font-weight: 700; display: flex; align-items: center; gap: 12px; letter-spacing: -.01em; color: var(--text-lib); }
          .badge-live-lib { display: inline-flex; align-items: center; gap: 6px; background: var(--pink-soft); color: var(--pink); font-size: 11px; font-weight: 700; padding: 5px 10px 5px 8px; border-radius: 20px; letter-spacing: .04em; }
          .badge-live-lib span.pulse-lib { width: 6px; height: 6px; border-radius: 50%; background: var(--pink); box-shadow: 0 0 0 3px var(--pink-glow); animation: pulse-anim 1.5s infinite; }
          @keyframes pulse-anim {
            0% { box-shadow: 0 0 0 0px var(--pink-glow); }
            70% { box-shadow: 0 0 0 6px var(--pink-glow); }
            100% { box-shadow: 0 0 0 0px var(--pink-glow); }
          }
          .subtitle-lib { color: var(--text-dim); font-size: 14px; margin-top: 6px; }
          .btn-add-lib { background: linear-gradient(135deg,#ff2d78,#c3105a); color: #fff; border: none; padding: 13px 22px; border-radius: 12px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 8px 24px -8px var(--pink-glow); transition: transform .15s ease,box-shadow .15s ease; }
          .btn-add-lib:hover { transform: translateY(-1px); box-shadow: 0 12px 28px -8px var(--pink-glow); }

          /* stats */
          .stats-lib { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
          .stat-lib { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px 22px; position: relative; overflow: hidden; }
          .stat-lib::before { content: ""; position: absolute; top: 0; left: 0; width: 3px; height: 100%; }
          .stat-lib.total::before { background: #3b82f6; }
          .stat-lib.pub::before { background: var(--green); }
          .stat-lib.draft::before { background: var(--amber); }
          .stat-lib.soon::before { background: var(--purple); }
          .stat-top-lib { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
          .stat-icon-lib { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
          .stat-lib.total .stat-icon-lib { background: #eff6ff; color: #2563eb; }
          .stat-lib.pub .stat-icon-lib { background: var(--green-soft); color: var(--green); }
          .stat-lib.draft .stat-icon-lib { background: var(--amber-soft); color: var(--amber); }
          .stat-lib.soon .stat-icon-lib { background: var(--purple-soft); color: var(--purple); }
          .stat-label-lib { font-size: 12px; color: var(--text-faint); text-transform: uppercase; letter-spacing: .07em; font-weight: 600; }
          .stat-value-lib { font-size: 32px; font-weight: 700; margin-top: 4px; letter-spacing: -.02em; color: var(--text-lib); }

          /* toolbar */
          .toolbar-lib { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; margin-bottom: 26px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
          .search-box-lib { flex: 1; min-width: 240px; display: flex; align-items: center; gap: 10px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 11px; padding: 11px 14px; color: var(--text-dim); }
          .search-box-lib input { background: none; border: none; outline: none; color: var(--text-lib); font-size: 14px; width: 100%; }
          .search-box-lib input::placeholder { color: var(--text-faint); }
          .select-lib { background: var(--panel-2); border: 1px solid var(--line); color: var(--text-lib); font-size: 13px; padding: 10px 32px 10px 14px; border-radius: 11px; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239499a6' stroke-width='1.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; cursor: pointer; }
          .view-toggle-lib { display: flex; background: var(--panel-2); border: 1px solid var(--line); border-radius: 11px; padding: 3px; }
          .view-toggle-lib button { border: none; background: none; color: var(--text-faint); width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
          .view-toggle-lib button.active { background: var(--pink-soft); color: var(--pink); }

          /* grid */
          .grid-lib { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
          @media (max-width: 1200px) { .grid-lib { grid-template-columns: repeat(3, 1fr); } }
          @media (max-width: 900px) { .grid-lib { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 600px) { .grid-lib { grid-template-columns: 1fr; } }

          .card-lib { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; display: flex; flex-direction: column; transition: border-color .15s ease, transform .15s ease; }
          .card-lib:hover { border-color: var(--line-soft); transform: translateY(-2px); }

          .card-media-lib { position: relative; aspect-ratio: 2/3; background-size: cover; background-position: center; display: flex; flex-direction: column; justify-content: space-between; padding: 14px; }
          .card-media-lib::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.05) 0%, rgba(0,0,0,.15) 40%, rgba(10,10,12,.95) 100%); }
          .media-top-lib { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; }
          .status-chip-lib { font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; padding: 6px 11px; border-radius: 8px; }
          .status-chip-lib.published { background: rgba(35,201,139,.16); color: var(--green); border: 1px solid rgba(35,201,139,.3); }
          .status-chip-lib.draft { background: rgba(242,169,60,.16); color: var(--amber); border: 1px solid rgba(242,169,60,.3); }
          .status-chip-lib.coming { background: rgba(139,108,242,.18); color: #b9a4ff; border: 1px solid rgba(139,108,242,.35); }
          .menu-dot-lib { width: 30px; height: 30px; border-radius: 9px; background: rgba(10,10,12,.5); border: 1px solid rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; backdrop-filter: blur(4px); }
          .media-bottom-lib { position: relative; z-index: 1; }
          .media-bottom-lib .title { font-size: 19px; font-weight: 700; color: #fff; letter-spacing: -.01em; }

          .card-body-lib { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 14px; flex-grow: 1; }
          .genre-line-lib { font-size: 12.5px; color: var(--text-dim); font-weight: 500; }

          .meta-row-lib { display: flex; gap: 16px; }
          .meta-pill-lib { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-dim); }
          .meta-pill-lib svg { width: 13px; height: 13px; color: var(--text-faint); }

          .lang-row-lib { display: flex; gap: 6px; flex-wrap: wrap; }
          .lang-tag-lib { font-size: 11px; font-weight: 600; background: var(--panel-2); color: var(--text-dim); border: 1px solid var(--line); padding: 4px 9px; border-radius: 6px; }
          .lang-tag-lib.more { color: var(--text-faint); }

          .credit-block-lib { font-size: 12px; color: var(--text-faint); line-height: 1.6; border-top: 1px solid var(--line-soft); padding-top: 12px; }
          .credit-block-lib b { color: var(--text-dim); font-weight: 600; }
          .credit-block-lib .label { color: var(--text-faint); font-weight: 500; }

          .toggle-row-lib { display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid var(--line-soft); padding-top: 12px; }
          .toggle-item-lib { display: flex; flex-direction: column; align-items: center; gap: 7px; flex: 1; }
          .toggle-item-lib .t-label { font-size: 10.5px; color: var(--text-faint); font-weight: 600; letter-spacing: .03em; text-transform: uppercase; }

          .switch-lib { position: relative; display: inline-block; width: 38px; height: 21px; cursor: pointer; flex-shrink: 0; }
          .switch-lib input { opacity: 0; width: 0; height: 0; }
          .slider-lib { position: absolute; inset: 0; background: var(--panel-2); border: 1px solid var(--line); border-radius: 20px; transition: .18s; }
          .slider-lib::before { content: ""; position: absolute; width: 15px; height: 15px; left: 2px; top: 2px; background: #6b7080; border-radius: 50%; transition: .18s; }
          .switch-lib input:checked + .slider-lib { background: var(--pink-soft); border-color: var(--pink); }
          .switch-lib input:checked + .slider-lib::before { transform: translateX(17px); background: var(--pink); }
          .switch-lib input:checked.trend + .slider-lib { background: var(--purple-soft); border-color: var(--purple); }
          .switch-lib input:checked.trend + .slider-lib::before { background: var(--purple); }
          .switch-lib input:checked.block + .slider-lib { background: var(--amber-soft); border-color: var(--amber); }
          .switch-lib input:checked.block + .slider-lib::before { background: var(--amber); }

          .card-foot-lib { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--line-soft); padding-top: 13px; margin-top: auto; }
          .updated-lib { font-size: 11.5px; color: var(--text-faint); }
          .manage-link-lib { font-size: 12.5px; font-weight: 600; color: var(--pink); display: flex; align-items: center; gap: 4px; cursor: pointer; text-decoration: none; }
          
          /* Table Styles */
          .table-lib { width: 100%; border-collapse: collapse; text-align: left; }
          .table-lib th { padding: 12px 16px; border-bottom: 1px solid var(--line); background: var(--panel-2); color: var(--text-dim); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          .table-lib td { padding: 16px; border-bottom: 1px solid var(--line); color: var(--text-lib); }
          .table-lib tr:hover { background: var(--panel-2); }

          /* footer pagination */
          .pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 30px; color: var(--text-dim); font-size: 13px; }
          .page-controls { display: flex; align-items: center; gap: 10px; }
          .page-btn { background: var(--panel); border: 1px solid var(--line); color: var(--text-dim); font-size: 13px; padding: 8px 14px; border-radius: 99px; cursor: pointer; transition: .15s; }
          .page-btn:hover:not(:disabled) { background: var(--panel-2); color: var(--pink); border-color: var(--pink); }
          .page-btn:disabled { opacity: .4; cursor: not-allowed; }
          .page-num { color: var(--text-lib); font-weight: 600; }
        `,
          }}
        />

        {/* ── Page header ── */}
        <div className="page-head-lib">
          <div>
            <div className="eyebrow-lib">
              Content hub <span className="dot-lib"></span> Series
            </div>
            <h1 className="title-lib">
              Series library
              <span className="badge-live-lib">
                <span className="pulse-lib"></span>
                {publishedCount} active
              </span>
            </h1>
            <p className="subtitle-lib">
              Manage all your OTT series, episodes, and related content.
            </p>
          </div>
          <button
            className="btn-add-lib"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus size={16} />
            Add series
          </button>
        </div>

        {/* ── Stats row ── */}
        <div className="stats-lib">
          <div className="stat-lib total">
            <div className="stat-top-lib">
              <div>
                <div className="stat-label-lib">Total series</div>
                <div className="stat-value-lib">{totalCount}</div>
              </div>
              <div className="stat-icon-lib">
                <Tv size={18} />
              </div>
            </div>
          </div>
          <div className="stat-lib pub">
            <div className="stat-top-lib">
              <div>
                <div className="stat-label-lib">Published</div>
                <div className="stat-value-lib">{publishedCount}</div>
              </div>
              <div className="stat-icon-lib">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4.5 w-4.5"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
          </div>
          <div className="stat-lib draft">
            <div className="stat-top-lib">
              <div>
                <div className="stat-label-lib">Draft</div>
                <div className="stat-value-lib">{draftCount}</div>
              </div>
              <div className="stat-icon-lib">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4.5 w-4.5"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="stat-lib soon">
            <div className="stat-top-lib">
              <div>
                <div className="stat-label-lib">Coming soon</div>
                <div className="stat-value-lib">{comingSoonCount}</div>
              </div>
              <div className="stat-icon-lib">
                <Clock size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="toolbar-lib">
          <div className="search-box-lib">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search series by title, genre, cast..."
              value={filters.search}
              onChange={(e) =>
                setFilters((c) => ({ ...c, search: e.target.value, page: 1 }))
              }
            />
          </div>
          <select
            className="select-lib"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          >
            <option value="all">All genres</option>
            {allGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            className="select-lib"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="coming_soon">Coming soon</option>
          </select>
          <select
            className="select-lib"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
          >
            <option value="all">All languages</option>
            {allLangs.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
            className="select-lib"
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
          >
            <option value="recent">Sort by: recent</option>
            <option value="title">Sort by: title</option>
            <option value="year">Sort by: year</option>
          </select>
          <div className="view-toggle-lib">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* ── Content area ── */}
        {loading ? (
          <SeriesSkeletonGrid />
        ) : filteredList.length === 0 ? (
          <EmptyState
            icon={Tv}
            title="No series found"
            description="Get started by adding a series to your library."
          />
        ) : viewMode === "grid" ? (
          <div className="grid-lib">
            {filteredList.map((series) => (
              <SeriesCard
                key={series._id || series.id}
                series={series}
                nowTime={nowTime}
                onToggleFlag={handleToggleFlag}
                onPrefetch={handlePrefetchSeriesDetail}
                onEdit={(s) => {
                  setEditing(s);
                  setOpen(true);
                }}
                onDelete={handleDelete}
                router={router}
              />
            ))}
          </div>
        ) : (
          /* ── List view (table) ── */
          <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="table-lib">
                <thead>
                  <tr>
                    <th>Series</th>
                    <th>Year</th>
                    <th>Seasons</th>
                    <th>Status Flags</th>
                    <th style={{ textRight: "right", textAlign: "right" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((series) => {
                    const sid = series._id || series.id;

                    let statusClass = "coming";
                    let statusText = "Coming soon";
                    if (series.isActive === false) {
                      statusClass = "draft";
                      statusText = "Draft";
                    } else if (!series.isComingSoon) {
                      statusClass = "published";
                      statusText = "Published";
                    }

                    const coverUrl =
                      series.posterUrl ||
                      series.thumbnailUrl ||
                      series.bannerUrl;

                    return (
                      <tr key={sid}>
                        <td>
                          <Link
                            href={`/series/${series.slug}`}
                            className="flex items-center gap-3 hover:opacity-85 transition"
                          >
                            <div className="h-12 w-16 shrink-0 rounded-lg overflow-hidden bg-[var(--admin-soft)]">
                              {coverUrl ? (
                                <img
                                  src={coverUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                                  <Tv size={18} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[var(--admin-foreground)]">
                                {series.title}
                              </p>
                              <p className="text-xs text-[var(--admin-muted)] truncate max-w-[200px]">
                                {(series.genres || []).join(", ")}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td>{series.releaseYear || "—"}</td>
                        <td>
                          {series.totalSeasons ?? series.seasonCount ?? 0}
                        </td>
                        <td>
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={`status-chip-lib ${statusClass}`}
                              style={{ alignSelf: "flex-start" }}
                            >
                              {statusText}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-[var(--admin-muted)] font-semibold mt-1">
                              <label className="flex items-center gap-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={!!series.isComingSoon}
                                  onChange={(e) =>
                                    handleToggleFlag(
                                      series,
                                      "isComingSoon",
                                      e.target.checked,
                                    )
                                  }
                                  className="rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-0 w-3 h-3 cursor-pointer"
                                />
                                Soon
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={!!series.isTrending}
                                  onChange={(e) =>
                                    handleToggleFlag(
                                      series,
                                      "isTrending",
                                      e.target.checked,
                                    )
                                  }
                                  className="rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-0 w-3 h-3 cursor-pointer"
                                />
                                Trending
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={!!series.isBlockbuster}
                                  onChange={(e) =>
                                    handleToggleFlag(
                                      series,
                                      "isBlockbuster",
                                      e.target.checked,
                                    )
                                  }
                                  className="rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-0 w-3 h-3 cursor-pointer"
                                />
                                Blockbuster
                              </label>
                            </div>
                            {series.isComingSoon && series.expectedReleaseDate && (
                              <span className="text-[10px] text-[#ec3f6f] font-semibold mt-1 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(series.expectedReleaseDate).toLocaleString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/seasons?series=${series.slug || String(series.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                              className="flex items-center gap-1 text-[11px] font-bold text-[var(--admin-accent)] border border-[var(--admin-border)] rounded-lg px-2.5 py-1.5 hover:bg-[var(--admin-soft)] transition"
                            >
                              Manage <ChevronRight size={11} />
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setEditing(series);
                                    setOpen(true);
                                  }}
                                >
                                  <Pencil size={14} /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => handleDelete(sid)}
                                  className="text-red-500"
                                >
                                  <Trash2 size={14} /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        <div className="pagination">
          <div>
            Showing{" "}
            {((data?.pagination?.page ?? 1) - 1) *
              (data?.pagination?.limit ?? 8) +
              1}{" "}
            to{" "}
            {Math.min(
              (data?.pagination?.page ?? 1) * (data?.pagination?.limit ?? 8),
              data?.pagination?.total ?? seriesList.length,
            )}{" "}
            of {data?.pagination?.total ?? seriesList.length} series
          </div>
          <div className="page-controls">
            <button
              className="page-btn"
              disabled={!(data?.pagination?.page && data.pagination.page > 1)}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <span className="page-num">
              Page {data?.pagination?.page ?? 1} of{" "}
              {data?.pagination?.totalPages ?? 1}
            </span>
            <button
              className="page-btn"
              disabled={
                !(
                  data?.pagination?.page &&
                  data.pagination.page < data.pagination.totalPages
                )
              }
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[min(1120px,calc(100vw-32px))]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                {editing ? "Edit Series Information" : "Add New Series"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Configure web series metadata, themes, ratings, banners, categories, and flags.
              </DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-6 series-library-admin">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Title
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      title: newTitle,
                      slug: slugify(newTitle),
                    }));
                  }}
                  required
                />
                <p className="text-[11px] text-[var(--admin-muted)] font-mono mt-1">
                  Slug: <span className="text-[var(--admin-primary)] font-semibold">{form.slug || slugify(form.title) || "-"}</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Theme Color
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={(() => {
                      const val = form.color || "0xFF1A1A2E";
                      if (val.startsWith("0xFF") && val.length === 10)
                        return `#${val.slice(4)}`;
                      if (val.startsWith("#")) return val;
                      return "#1A1A2E";
                    })()}
                    onChange={(e) => {
                      const hex = e.target.value;
                      setForm({
                        ...form,
                        color: `0xFF${hex.slice(1).toUpperCase()}`,
                      });
                    }}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={form.color || ""}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    placeholder="e.g. 0xFF1A1A2E"
                    className="flex-grow font-mono text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Release Year
                </label>
                <Input
                  type="number"
                  value={form.releaseYear}
                  onChange={(e) =>
                    setForm({ ...form, releaseYear: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Age Rating
                </label>
                <Select
                  value={form.ageRating}
                  onChange={(e) =>
                    setForm({ ...form, ageRating: e.target.value })
                  }
                >
                  <option value="">Select Age Rating</option>
                  <option value="U">U (All Ages)</option>
                  <option value="U/A 7+">U/A 7+</option>
                  <option value="U/A 13+">U/A 13+</option>
                  <option value="U/A 16+">U/A 16+</option>
                  <option value="A 18+">A 18+</option>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* Cast & Crew Management */}
            <div className="rounded-[var(--radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--admin-border)] pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-foreground)]">
                    Cast &amp; Crew
                  </h4>
                  <p className="text-[10px] text-[var(--admin-muted)] mt-0.5">
                    Search and select artists from the database.
                  </p>
                </div>
                <a
                  href="/admin/artists"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-pink-500 hover:text-pink-600 font-bold flex items-center gap-1 self-start sm:self-center"
                >
                  Go to Artist Management ↗
                </a>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <ArtistSearchDropdown
                  label="Actors"
                  placeholder="Type name to search..."
                  type="actor"
                  selected={form.cast?.actors || []}
                  onChange={(val) =>
                    setForm({ ...form, cast: { ...form.cast, actors: val } })
                  }
                  disabled={submitting}
                  notify={notify}
                />

                <ArtistSearchDropdown
                  label="Directors"
                  placeholder="Type name to search..."
                  type="director"
                  selected={form.cast?.directors || []}
                  onChange={(val) =>
                    setForm({ ...form, cast: { ...form.cast, directors: val } })
                  }
                  disabled={submitting}
                  notify={notify}
                />

                <ArtistSearchDropdown
                  label="Writers"
                  placeholder="Type name to search..."
                  type="writer"
                  selected={form.cast?.writers || []}
                  onChange={(val) =>
                    setForm({ ...form, cast: { ...form.cast, writers: val } })
                  }
                  disabled={submitting}
                  notify={notify}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <MultiSelectField
                label="Categories / Genres"
                placeholder="Select genres..."
                options={genresList}
                selected={form.genres}
                onChange={(val) => setForm({ ...form, genres: val.join(", ") })}
                disabled={submitting}
              />
              <MultiSelectField
                label="Languages"
                placeholder="Select languages..."
                options={languagesList}
                selected={form.language}
                onChange={(val) =>
                  setForm({ ...form, language: val.join(", ") })
                }
                disabled={submitting}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUploadField
                label="Poster Image"
                currentUrl={form.posterUrl !== undefined ? form.posterUrl : editing?.posterUrl}
                file={posterFile}
                onFileChange={setPosterFile}
                onClear={() => {
                  setPosterFile(null);
                  setForm((prev) => ({ ...prev, posterUrl: "" }));
                  if (editing) editing.posterUrl = "";
                }}
                aspectRatio="2/3"
                disabled={submitting}
              />
              <ImageUploadField
                label="Banner Image"
                currentUrl={form.bannerUrl !== undefined ? form.bannerUrl : editing?.bannerUrl}
                file={bannerFile}
                onFileChange={setBannerFile}
                onClear={() => {
                  setBannerFile(null);
                  setForm((prev) => ({ ...prev, bannerUrl: "" }));
                  if (editing) editing.bannerUrl = "";
                }}
                aspectRatio="16/9"
                disabled={submitting}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-3 border-t border-b border-[var(--admin-border)]">
              <div className="flex items-center gap-2">
                <label className="switch-lib">
                  <input
                    type="checkbox"
                    checked={!!form.isComingSoon}
                    onChange={(e) =>
                      handleFormFlagChange("isComingSoon", e.target.checked)
                    }
                  />
                  <span className="slider-lib"></span>
                </label>
                <span className="text-sm font-semibold text-[var(--admin-foreground)]">
                  Coming Soon
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="switch-lib">
                  <input
                    className="trend"
                    type="checkbox"
                    checked={!!form.isTrending}
                    onChange={(e) =>
                      handleFormFlagChange("isTrending", e.target.checked)
                    }
                  />
                  <span className="slider-lib"></span>
                </label>
                <span className="text-sm font-semibold text-[var(--admin-foreground)]">
                  Trending
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="switch-lib">
                  <input
                    className="block"
                    type="checkbox"
                    checked={!!form.isBlockbuster}
                    onChange={(e) =>
                      handleFormFlagChange(
                        "isBlockbuster",
                        e.target.checked,
                      )
                    }
                  />
                  <span className="slider-lib"></span>
                </label>
                <span className="text-sm font-semibold text-[var(--admin-foreground)]">
                  Blockbuster
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="switch-lib">
                  <input
                    type="checkbox"
                    checked={!!form.isFeatured}
                    onChange={(e) =>
                      handleFormFlagChange("isFeatured", e.target.checked)
                    }
                  />
                  <span className="slider-lib"></span>
                </label>
                <span className="text-sm font-semibold text-[var(--admin-foreground)]">
                  Featured
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="switch-lib">
                  <input
                    type="checkbox"
                    checked={!!form.isActive}
                    onChange={(e) =>
                      handleFormFlagChange("isActive", e.target.checked)
                    }
                  />
                  <span className="slider-lib"></span>
                </label>
                <span className="text-sm font-semibold text-[var(--admin-foreground)]">
                  Active
                </span>
              </div>
            </div>

            {form.isComingSoon && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Expected Release Date & Time
                </label>
                <Input
                  type="datetime-local"
                  value={form.expectedReleaseDate}
                  onChange={(e) =>
                    setForm({ ...form, expectedReleaseDate: e.target.value })
                  }
                  required={form.isComingSoon}
                  min={toLocalDatetimeString(new Date())}
                />
              </div>
            )}
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Series"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ComingSoonModal
        isOpen={comingSoonModal.isOpen}
        onClose={() =>
          setComingSoonModal({
            isOpen: false,
            series: null,
            initialDate: "",
          })
        }
        title={
          comingSoonModal.series
            ? `Mark "${comingSoonModal.series.title}" as coming soon`
            : "Mark as coming soon"
        }
        initialDate={comingSoonModal.initialDate}
        onSave={(dateIso) => {
          const { series } = comingSoonModal;
          setComingSoonModal({
            isOpen: false,
            series: null,
            initialDate: "",
          });
          handleToggleFlag(series, "isComingSoon", true, dateIso);
        }}
      />
    </PageShell>
  );
}

// Multipart upload manager — returns a controller object with { promise, pause, resume, cancel }
// onProgress(percent, speedBps, etaSec) — called during upload
// Minimum S3 part size is 5 MB (except last part)
const PART_SIZE = 10 * 1024 * 1024; // 10 MB per chunk

function createMultipartUpload(file, folder, onProgress) {
  let paused = false;
  let cancelled = false;
  let currentXhr = null;
  let pauseResolver = null;
  let uploadId = null;
  let key = null;

  // For speed calculation
  let startTime = null;
  let bytesUploadedSoFar = 0;

  const waitIfPaused = () =>
    new Promise((resolve) => {
      if (!paused) {
        resolve();
        return;
      }
      pauseResolver = resolve;
    });

  const controller = {
    pause() {
      paused = true;
      if (currentXhr) {
        currentXhr.abort();
        currentXhr = null;
      }
    },
    resume() {
      paused = false;
      if (pauseResolver) {
        pauseResolver();
        pauseResolver = null;
      }
    },
    cancel() {
      cancelled = true;
      paused = false;
      if (currentXhr) {
        currentXhr.abort();
        currentXhr = null;
      }
      if (pauseResolver) {
        pauseResolver();
        pauseResolver = null;
      }
      // Abort the S3 multipart upload in background
      if (uploadId && key) {
        fetch("/api/admin/upload/multipart/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, uploadId, abort: true }),
        }).catch(() => {});
      }
    },
  };

  controller.promise = (async () => {
    // 1. Initiate multipart upload
    const initRes = await fetch("/api/admin/upload/multipart/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        folder,
      }),
    });
    const initData = await initRes.json();
    if (!initData.success)
      throw new Error(initData.message || "Failed to initiate upload");

    uploadId = initData.uploadId;
    key = initData.key;
    const publicUrl = initData.url;

    const totalParts = Math.ceil(file.size / PART_SIZE);
    const completedParts = [];
    startTime = Date.now();

    // 2. Upload each part
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      if (cancelled) throw new Error("Upload cancelled");
      await waitIfPaused();
      if (cancelled) throw new Error("Upload cancelled");

      const start = (partNumber - 1) * PART_SIZE;
      const end = Math.min(start + PART_SIZE, file.size);
      const chunk = file.slice(start, end);

      // Get presigned URL for this part
      const partUrlRes = await fetch("/api/admin/upload/multipart/part-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, uploadId, partNumber }),
      });
      const partUrlData = await partUrlRes.json();
      if (!partUrlData.success) throw new Error("Failed to get part URL");

      // Upload this part via XHR so we can track progress & cancel
      const etag = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        currentXhr = xhr;

        let partBytesAtStart = bytesUploadedSoFar;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const totalUploaded = partBytesAtStart + e.loaded;
            const elapsed = (Date.now() - startTime) / 1000;
            const speedBps = elapsed > 0 ? totalUploaded / elapsed : 0;
            const remaining = file.size - totalUploaded;
            const etaSec = speedBps > 0 ? remaining / speedBps : 0;
            const pct = Math.round((totalUploaded / file.size) * 100);
            if (onProgress) onProgress(Math.min(pct, 99), speedBps, etaSec);
          }
        };

        xhr.onload = () => {
          currentXhr = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            const etag = xhr.getResponseHeader("ETag");
            bytesUploadedSoFar += chunk.size;
            resolve(etag);
          } else {
            reject(
              new Error(`Part ${partNumber} upload failed: ${xhr.status}`),
            );
          }
        };
        xhr.onerror = () => {
          currentXhr = null;
          reject(new Error("Network error during part upload"));
        };
        xhr.onabort = () => {
          currentXhr = null;
          reject(new Error("__ABORTED__"));
        };

        xhr.open("PUT", partUrlData.signedUrl);
        xhr.send(chunk);
      }).catch(async (err) => {
        if (err.message === "__ABORTED__" && paused && !cancelled) {
          // Paused — wait for resume then retry this part
          await waitIfPaused();
          if (cancelled) throw new Error("Upload cancelled");
          // Re-run this part by decrementing partNumber
          partNumber--;
          return null;
        }
        throw err;
      });

      if (etag === null) {
        partNumber--;
        continue;
      } // retry part
      completedParts.push({ PartNumber: partNumber, ETag: etag });
    }

    if (cancelled) throw new Error("Upload cancelled");

    // 3. Complete multipart upload
    const completeRes = await fetch("/api/admin/upload/multipart/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, uploadId, parts: completedParts }),
    });
    const completeData = await completeRes.json();
    if (!completeData.success)
      throw new Error(completeData.message || "Failed to complete upload");

    if (onProgress) onProgress(100, 0, 0);
    return { url: publicUrl, key };
  })();

  return controller;
}

// Legacy single-part presigned upload for small files / other uses
async function uploadToS3(file, folder, onProgress) {
  const res = await fetch("/api/admin/upload/presigned", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder,
    }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve({ url: data.url, key: data.key });
      } else {
        reject(new Error("S3 upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("S3 upload failed"));
    xhr.open("PUT", data.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

function SeasonTrailerManager({ trailers, setTrailers, languagesList }) {
  const qualities = ["4k", "1080p", "720p", "480p", "360p"];

  const addLanguage = () => {
    setTrailers([
      ...trailers,
      { language: "", title: "", description: "", files: [] },
    ]);
  };

  const removeLanguage = (index) => {
    setTrailers(trailers.filter((_, i) => i !== index));
  };

  const updateLanguage = (index, key, val) => {
    const next = [...trailers];
    next[index][key] = val;
    setTrailers(next);
  };

  const setQualityFile = (langIndex, quality, uploadData) => {
    const next = [...trailers];
    let files = next[langIndex].files || [];

    if (!uploadData) {
      files = files.filter((f) => f.quality !== quality);
    } else {
      const idx = files.findIndex((f) => f.quality === quality);
      const newFile = {
        quality,
        videoUrl: uploadData.url,
        videoKey: uploadData.key,
        fileSize: uploadData.size,
        duration: uploadData.duration,
        mimeType: uploadData.type,
      };
      if (idx >= 0) files[idx] = newFile;
      else files.push(newFile);
    }
    next[langIndex].files = files;
    setTrailers(next);
  };

  return (
    <div className="mt-6 border-t border-[var(--admin-border)] pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--admin-foreground)]">
          Season Trailers
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
          <Plus size={14} className="mr-1" /> Add Language
        </Button>
      </div>

      <div className="space-y-6">
        {trailers.map((tr, langIdx) => (
          <div
            key={langIdx}
            className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4 relative"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
              onClick={() => removeLanguage(langIdx)}
            >
              <Trash2 size={16} />
            </Button>

            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label className="text-xs font-bold uppercase text-[var(--admin-muted)]">
                  Language
                </label>
                <Select
                  value={tr.language}
                  onChange={(e) =>
                    updateLanguage(langIdx, "language", e.target.value)
                  }
                >
                  <option value="">-- Select Language --</option>
                  {languagesList.map((l) => (
                    <option key={l.code || l.englishName} value={l.englishName}>
                      {l.englishName}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[var(--admin-muted)]">
                  Trailer Title
                </label>
                <Input
                  value={tr.title}
                  onChange={(e) =>
                    updateLanguage(langIdx, "title", e.target.value)
                  }
                  placeholder="Trailer Title"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {qualities.map((q) => {
                const existing = (tr.files || []).find((f) => f.quality === q);
                return (
                  <div
                    key={q}
                    className="border border-[var(--admin-border)] rounded p-2 bg-white dark:bg-black/20"
                  >
                    <VideoUploadField
                      label={`${q} Quality`}
                      currentUrl={existing?.videoUrl}
                      onFileChange={(data) => setQualityFile(langIdx, q, data)}
                      onDirectUpload={(f, prog) =>
                        uploadToS3(f, "trailers", prog)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeasonsView({
  data,
  loading,
  refresh,
  notify,
  selectedSeriesId,
  setSelectedSeriesId,
  selectedSeriesTitle,
  setSelectedSeriesTitle,
}) {
  const [seasons, setSeasons] = useState([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const router = useRouter();
  const [form, setForm] = useState({
    seasonNumber: "",
    title: "",
    description: "",
    poster: "",
    isActive: true,
  });
  const [trailers, setTrailers] = useState([]);
  const [languagesList, setLanguagesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Selected cast states
  const [selectedCast, setSelectedCast] = useState({
    actors: [],
    directors: [],
    writers: [],
  });

  const handleToggleCast = (roleType, member) => {
    setSelectedCast((prev) => {
      const currentList = prev[roleType] || [];
      const exists = currentList.some((m) => m.name === member.name);
      const updatedList = exists
        ? currentList.filter((m) => m.name !== member.name)
        : [...currentList, member];
      return {
        ...prev,
        [roleType]: updatedList,
      };
    });
  };

  const renderCastChecklist = () => {
    const seriesCast = activeSeries?.cast;
    if (!seriesCast) return null;

    const roles = [
      { label: "Actors", key: "actors" },
      { label: "Directors", key: "directors" },
      { label: "Writers", key: "writers" },
    ];

    const hasAnyCast =
      (seriesCast.actors?.length || 0) +
        (seriesCast.directors?.length || 0) +
        (seriesCast.writers?.length || 0) >
      0;

    if (!hasAnyCast) {
      return (
        <div className="text-[10px] text-[var(--admin-muted)] bg-[var(--admin-soft)]/50 p-3 rounded-lg border border-[var(--admin-border)]">
          No cast members defined on the series level yet. Edit the series
          details first to add cast.
        </div>
      );
    }

    return (
      <div className="space-y-4 border-t border-[var(--admin-border)] pt-4">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
          Select Season Cast Subset
        </label>
        {roles.map(({ label, key }) => {
          const members = seriesCast[key] || [];
          if (members.length === 0) return null;

          return (
            <div key={key} className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#ff4fa3] block">
                {label}
              </span>
              <div className="grid grid-cols-2 gap-2 bg-[var(--admin-soft)]/30 p-3 rounded-lg border border-[var(--admin-border)]">
                {members.map((m) => {
                  const selectedList = selectedCast[key] || [];
                  const isChecked = selectedList.some((x) => x.name === m.name);
                  return (
                    <label
                      key={m.name}
                      className="flex items-center gap-2.5 text-xs font-semibold text-[var(--admin-foreground)] cursor-pointer select-none p-1 hover:bg-[var(--admin-soft)]/40 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCast(key, m)}
                        className="rounded border-[var(--admin-border)] text-[#ff4fa3] focus:ring-[#ff4fa3] w-3.5 h-3.5"
                      />
                      <div className="h-6 w-6 rounded-full overflow-hidden bg-[var(--admin-soft)] border border-[var(--admin-border)] shrink-0 flex items-center justify-center">
                        {m.photo ? (
                          <img
                            src={m.photo}
                            alt=""
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-[10px] text-[var(--admin-muted)] uppercase font-bold">
                            {m.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="truncate">{m.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("seasonNumber"); // seasonNumber, title, episodeCount
  const [searchQuery, setSearchQuery] = useState("");
  const [isOrderDirty, setIsOrderDirty] = useState(false);

  const seriesList = data?.series || [];
  const activeSeries = seriesList.find(
    (s) => (s._id || s.id) === selectedSeriesId,
  );

  // Sync title when series selection changes
  useEffect(() => {
    if (selectedSeriesId && seriesList.length > 0) {
      const found = seriesList.find(
        (s) => (s._id || s.id) === selectedSeriesId,
      );
      if (found && found.title !== selectedSeriesTitle) {
        setSelectedSeriesTitle(found.title);
      }
    }
  }, [
    selectedSeriesId,
    seriesList,
    selectedSeriesTitle,
    setSelectedSeriesTitle,
  ]);

  useEffect(() => {
    fetch("/api/languages")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLanguagesList(data.languages || []);
      })
      .catch(console.error);
  }, []);

  async function loadSeasons() {
    if (!selectedSeriesId) {
      setSeasons([]);
      return;
    }
    setLoadingSeasons(true);
    try {
      const res = await apiFetch(
        `/api/admin/series/${selectedSeriesId}/seasons`,
      );
      setSeasons(res.seasons || []);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoadingSeasons(false);
    }
  }

  useEffect(() => {
    loadSeasons();
    setIsOrderDirty(false);
  }, [selectedSeriesId]);

  useEffect(() => {
    if (editing) {
      setForm({
        seasonNumber: editing.seasonNumber || "",
        title: editing.title || "",
        description: editing.description || "",
        poster: editing.poster || "",
        isActive: editing.isActive !== false,
      });
      setTrailers(editing.trailers || []);
      const sc = editing.cast || {};
      setSelectedCast({
        actors: sc.actors || [],
        directors: sc.directors || [],
        writers: sc.writers || [],
      });
    } else {
      setForm({
        seasonNumber: seasons.length + 1,
        title: "",
        description: "",
        poster: "",
        isActive: true,
      });
      setTrailers([]);
      setSelectedCast({ actors: [], directors: [], writers: [] });
    }
  }, [editing, open, seasons.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.seasonNumber) return notify("Season number is required", "error");
    setSubmitting(true);

    try {
      const body = {
        seasonNumber: Number(form.seasonNumber),
        title: form.title || `Season ${form.seasonNumber}`,
        description: form.description || "",
        poster: form.poster || "",
        isActive: form.isActive !== false,
        trailers,
        cast: selectedCast,
      };

      let url = `/api/admin/series/${selectedSeriesId}/seasons`;
      let method = "POST";

      if (editing) {
        body.seasonId = editing._id || editing.id;
        method = "PUT";
      }

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(body),
      });

      notify(editing ? "Season updated" : "Season created");
      setOpen(false);
      setEditing(null);
      loadSeasons();
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(seasonId) {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this season and all its episodes?"
    );
    if (!confirmed) return;
    try {
      await apiFetch(`/api/admin/series/${selectedSeriesId}/seasons`, {
        method: "DELETE",
        body: JSON.stringify({ seasonId }),
      });
      notify("Season deleted");
      loadSeasons();
      refresh();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // Sorting and filtering
  const filteredSeasons = seasons
    .filter((season) => {
      const matchQuery =
        String(season.title || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(season.seasonNumber || "").includes(searchQuery);
      return matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === "seasonNumber") {
        return Number(a.seasonNumber || 0) - Number(b.seasonNumber || 0);
      }
      if (sortBy === "title") {
        return String(a.title || "").localeCompare(String(b.title || ""));
      }
      if (sortBy === "episodeCount") {
        return Number(b.episodeCount || 0) - Number(a.episodeCount || 0);
      }
      return 0;
    });

  // Reorder seasons handler
  const handleReorder = (newOrder) => {
    setSeasons(newOrder);
    setIsOrderDirty(true);
  };

  const saveNewOrder = async () => {
    try {
      setLoadingSeasons(true);
      const mappings = seasons.map((s, idx) => ({
        seasonId: s._id || s.id,
        seasonNumber: idx + 1,
      }));
      await apiFetch(`/api/admin/series/${selectedSeriesId}/seasons`, {
        method: "PUT",
        body: JSON.stringify({
          action: "reorder",
          seasons: mappings,
        }),
      });
      notify("Seasons order saved successfully");
      setIsOrderDirty(false);
      loadSeasons();
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoadingSeasons(false);
    }
  };

  // Completion calculation
  const getCompletionPercent = (s) => {
    let percent = 0;
    if (s.episodeCount > 0) percent += 70;
    if (s.trailers && s.trailers.length > 0) percent += 26;
    return percent;
  };

  const totalEpisodes = seasons.reduce(
    (sum, s) => sum + (s.episodeCount || 0),
    0,
  );
  const activeLanguagesCount = Array.isArray(activeSeries?.language)
    ? activeSeries.language.length
    : typeof activeSeries?.language === "string"
      ? activeSeries.language.split(",").filter(Boolean).length
      : 0;

  return (
    <PageShell>
      {/* 1. Series Selection Panel */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--admin-surface)] p-4 rounded-xl border border-[var(--admin-border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--admin-muted)]">
              Select Series
            </span>
            <div className="relative flex items-center bg-[var(--admin-soft)] rounded-lg px-3 py-1.5 border border-[var(--admin-border)]">
              {activeSeries &&
                (activeSeries.posterUrl || activeSeries.thumbnailUrl) && (
                  <img
                    src={activeSeries.posterUrl || activeSeries.thumbnailUrl}
                    alt=""
                    className="h-6 w-5 object-cover rounded mr-2"
                  />
                )}
              <Select
                value={selectedSeriesId}
                onChange={(e) => setSelectedSeriesId(e.target.value)}
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-[var(--admin-foreground)] cursor-pointer pr-8"
              >
                <option value="">-- Choose Series --</option>
                {seriesList.map((series) => (
                  <option
                    key={series._id || series.id}
                    value={series._id || series.id}
                  >
                    {series.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        {selectedSeriesId && (
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="bg-[#0052cc] hover:bg-[#0047b3] text-white flex items-center gap-1.5"
          >
            <Plus size={16} /> Create Season
          </Button>
        )}
      </div>

      {selectedSeriesId ? (
        <div className="space-y-6">
          {/* 2. Series Metadata Info Banner */}
          {activeSeries && (
            <div className="relative overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-sm flex flex-col md:flex-row gap-5">
              <div className="w-28 h-40 shrink-0 rounded-lg overflow-hidden bg-[var(--admin-soft)] border border-[var(--admin-border)] shadow-inner">
                {activeSeries.posterUrl || activeSeries.thumbnailUrl ? (
                  <img
                    src={activeSeries.posterUrl || activeSeries.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Tv className="h-full w-full p-6 text-[var(--admin-muted)]" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-2xl font-bold font-display text-[var(--admin-foreground)]">
                      {activeSeries.title}
                    </h2>
                    <span
                      className={cn(
                        "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border",
                        activeSeries.isActive !== false
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-amber-50 border-amber-200 text-amber-700",
                      )}
                    >
                      {activeSeries.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--admin-muted)] leading-relaxed max-w-3xl line-clamp-3">
                    {activeSeries.description ||
                      "No description provided for this series."}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--admin-border)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-[var(--admin-muted)]" />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-muted)] leading-none">
                        Created On
                      </p>
                      <p className="text-xs font-bold text-[var(--admin-foreground)] mt-1">
                        {activeSeries.createdAt
                          ? new Date(activeSeries.createdAt).toLocaleDateString(
                              "en-IN",
                              { dateStyle: "medium" },
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tv size={15} className="text-[var(--admin-muted)]" />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-muted)] leading-none">
                        Total Seasons
                      </p>
                      <p className="text-xs font-bold text-[var(--admin-foreground)] mt-1">
                        {seasons.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PlayCircle
                      size={15}
                      className="text-[var(--admin-muted)]"
                    />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-muted)] leading-none">
                        Total Episodes
                      </p>
                      <p className="text-xs font-bold text-[var(--admin-foreground)] mt-1">
                        {totalEpisodes}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={15} className="text-[var(--admin-muted)]" />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-muted)] leading-none">
                        Languages
                      </p>
                      <p className="text-xs font-bold text-[var(--admin-foreground)] mt-1">
                        {activeLanguagesCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCcw
                      size={15}
                      className="text-[var(--admin-muted)]"
                    />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-muted)] leading-none">
                        Last Updated
                      </p>
                      <p className="text-xs font-bold text-[var(--admin-foreground)] mt-1">
                        {activeSeries.updatedAt
                          ? new Date(activeSeries.updatedAt).toLocaleDateString(
                              "en-IN",
                              { dateStyle: "medium" },
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. KPI Counter Statistics Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[var(--admin-surface)] p-4 rounded-xl border border-[var(--admin-border)] shadow-sm flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Tv size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-muted)]">
                  Total Seasons
                </p>
                <p className="text-xl font-bold text-[var(--admin-foreground)] mt-0.5">
                  {seasons.length}
                </p>
              </div>
            </div>
            <div className="bg-[var(--admin-surface)] p-4 rounded-xl border border-[var(--admin-border)] shadow-sm flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <PlayCircle size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-muted)]">
                  Total Episodes
                </p>
                <p className="text-xl font-bold text-[var(--admin-foreground)] mt-0.5">
                  {totalEpisodes}
                </p>
              </div>
            </div>
            <div className="bg-[var(--admin-surface)] p-4 rounded-xl border border-[var(--admin-border)] shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--admin-muted)]">
                  Languages
                </p>
                <p className="text-xl font-bold text-[var(--admin-foreground)] mt-0.5">
                  {activeLanguagesCount}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Toolbar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--admin-border)] pb-4">
            <h3 className="text-lg font-bold font-display text-[var(--admin-foreground)] flex items-center gap-2">
              All Seasons{" "}
              <span className="bg-[var(--admin-soft)] text-[var(--admin-primary)] px-2.5 py-0.5 rounded-full text-xs font-bold">
                {filteredSeasons.length}
              </span>
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
                />
                <Input
                  type="text"
                  placeholder="Search seasons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 h-9 w-48 text-xs bg-[var(--admin-surface)]"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg h-9 px-2 gap-1 text-xs">
                <ArrowUpDown size={13} className="text-[var(--admin-muted)]" />
                <span className="text-[var(--admin-muted)] select-none">
                  Sort:
                </span>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 p-0 text-xs font-semibold cursor-pointer"
                >
                  <option value="seasonNumber">Season Number</option>
                  <option value="title">Title</option>
                  <option value="episodeCount">Episode Count</option>
                </Select>
              </div>

              {/* Grid/List View Toggles */}
              <div className="flex items-center border border-[var(--admin-border)] rounded-lg overflow-hidden bg-[var(--admin-surface)] h-9 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-md transition",
                    viewMode === "grid"
                      ? "bg-[var(--admin-soft)] text-[var(--admin-primary)]"
                      : "text-[var(--admin-muted)]",
                  )}
                  title="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded-md transition",
                    viewMode === "list"
                      ? "bg-[var(--admin-soft)] text-[var(--admin-primary)]"
                      : "text-[var(--admin-muted)]",
                  )}
                  title="List View / Drag Reorder"
                >
                  <List size={15} />
                </button>
              </div>

              {/* Save order button */}
              {isOrderDirty && viewMode === "list" && (
                <Button
                  onClick={saveNewOrder}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-3 text-xs rounded shadow flex items-center gap-1.5"
                >
                  <Check size={14} /> Save Order
                </Button>
              )}
            </div>
          </div>

          {/* 5. Grid View and List (Reorder) View */}
          {loadingSeasons ? (
            <SeasonsSkeletonGrid />
          ) : filteredSeasons.length === 0 ? (
            <EmptyState
              icon={Tv}
              title="No seasons found"
              description="Create a season to manage episodes for this series."
            />
          ) : viewMode === "grid" ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredSeasons.map((season) => {
                const isPublished = season.isActive !== false;
                const completion = getCompletionPercent(season);
                const coverUrl =
                  season.poster ||
                  activeSeries?.posterUrl ||
                  activeSeries?.thumbnailUrl;

                return (
                  <div
                    key={season._id || season.id}
                    className="group flex flex-col bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] overflow-hidden shadow-sm hover:shadow-md transition duration-300"
                  >
                    {/* Cover image area */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--admin-soft)] shadow-inner">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <Tv className="h-full w-full p-16 text-[var(--admin-muted)]" />
                      )}

                      {/* Overlays */}
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                        Season {season.seasonNumber}
                      </div>

                      {/* Dropdown menu overlay */}
                      <div className="absolute bottom-3 right-3 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 rounded-lg bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition">
                              <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-36 bg-[var(--admin-surface)] border-[var(--admin-border)]"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(season);
                                setOpen(true);
                              }}
                              className="text-xs font-semibold cursor-pointer"
                            >
                              <Pencil size={13} className="mr-2" /> Edit Season
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDelete(season._id || season.id)
                              }
                              className="text-xs font-semibold text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer"
                            >
                              <Trash2 size={13} className="mr-2" /> Delete
                              Season
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Metadata & Progress details area */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-base text-[var(--admin-foreground)] leading-tight truncate">
                          {season.title}
                        </h4>
                        {season.description && (
                          <p className="mt-1 text-xs text-[var(--admin-muted)] line-clamp-2">
                            {season.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 pt-2">
                        {/* Specs grid */}
                        <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs border-b border-[var(--admin-border)] pb-2 text-[var(--admin-muted)]">
                          <div>
                            <span className="font-bold block text-[10px] uppercase text-[var(--admin-muted)]">
                              Episodes
                            </span>
                            <span className="font-bold text-[var(--admin-foreground)]">
                              {season.episodeCount || 0}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold block text-[10px] uppercase text-[var(--admin-muted)]">
                              Trailer
                            </span>
                            <span
                              className={cn(
                                "font-bold",
                                season.trailers && season.trailers.length > 0
                                  ? "text-emerald-600"
                                  : "text-rose-500",
                              )}
                            >
                              {season.trailers && season.trailers.length > 0
                                ? "Uploaded"
                                : "Not Uploaded"}
                            </span>
                          </div>
                        </div>

                        {/* Completion progress */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-[var(--admin-muted)] mb-1">
                            <span>Completion</span>
                            <span className="text-[var(--admin-foreground)]">
                              {completion}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-[var(--admin-soft)] overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                completion > 80
                                  ? "bg-emerald-500"
                                  : completion > 40
                                    ? "bg-amber-500"
                                    : "bg-rose-500",
                              )}
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => {
                          const seriesSlug = activeSeries?.slug || String(activeSeries?.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
                          router.push(
                            `/admin/episodes?series=${seriesSlug}&season=${season.seasonNumber}`,
                          );
                        }}
                        className="w-full mt-2 border-[var(--admin-primary)] text-[var(--admin-primary)] hover:bg-[var(--admin-soft)] flex items-center justify-center gap-1.5 text-xs font-bold"
                      >
                        Manage Season <ChevronRight size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Reorder Drag & Drop List view
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-sm">
              <p className="text-xs text-[var(--admin-muted)] font-semibold mb-4 bg-[var(--admin-soft)] p-2.5 rounded-lg border border-[var(--admin-border)]">
                💡 Drag the handles <span className="font-bold">::</span> on the
                left to reorder seasons. Hit the green{" "}
                <span className="font-bold">Save Order</span> button when
                completed.
              </p>
              <Reorder.Group
                axis="y"
                values={filteredSeasons}
                onReorder={handleReorder}
                className="space-y-2"
              >
                {filteredSeasons.map((season) => (
                  <Reorder.Item
                    key={season._id || season.id}
                    value={season}
                    className="flex items-center gap-3 bg-[var(--admin-surface)] p-3 border border-[var(--admin-border)] rounded-lg shadow-sm hover:shadow transition duration-200"
                  >
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing p-1.5 text-[var(--admin-muted)] hover:bg-[var(--admin-soft)] rounded">
                      <GripVertical size={16} />
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--admin-soft)] text-[var(--admin-primary)] flex items-center justify-center font-bold text-sm">
                          {season.seasonNumber}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--admin-foreground)]">
                            {season.title}
                          </p>
                          <p className="text-xs text-[var(--admin-muted)]">
                            {season.episodeCount || 0} episodes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditing(season);
                              setOpen(true);
                            }}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(season._id || season.id)
                            }
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Tv}
          title="Select a series"
          description="Choose a series from the dropdown selection box above to manage its seasons."
        />
      )}

      {/* 6. Add/Edit Season Dialog Drawer */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[min(1100px,calc(100vw-32px))]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                {editing ? "Edit Season" : "Add Season"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Configure season numbers, episode titles, and cast member credits.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                    Season Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={form.seasonNumber}
                    onChange={(e) =>
                      setForm({ ...form, seasonNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                    Season Title
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Season 1"
                  />
                </div>
              </div>

              {renderCastChecklist()}
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? (editing ? "Saving..." : "Creating...") : (editing ? "Save Changes" : "Create Season")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function EpisodeQualitiesList({ episode }) {
  const status = episode.transcodingStatus || "completed";
  const qualities = ["4k", "1080p", "720p", "480p", "360p"];
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!["pending", "queued", "uploading", "processing"].includes(status)) {
      setElapsed(0);
      return undefined;
    }

    const updatedAtMs = new Date(episode.updatedAt || Date.now()).getTime();
    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - updatedAtMs) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [status, episode.updatedAt]);

  const languageVideos = [];
  if (Array.isArray(episode.languages)) {
    episode.languages.forEach((lang) => {
      if (Array.isArray(lang.videoFiles)) {
        lang.videoFiles.forEach((file) => {
          if (file.videoUrl) {
            languageVideos.push({
              language: lang.language,
              quality: file.quality,
              url: file.videoUrl,
            });
          }
        });
      }
    });
  }

  const hasHlsVideos = Boolean(
    episode.videoUrl || episode.videoKey_HD || episode.hlsMasterUrl,
  );
  const hasLangVideos = languageVideos.length > 0;

  if (!hasHlsVideos && !hasLangVideos) {
    return <span className="text-xs text-[var(--admin-muted)]">No Video</span>;
  }

  const elapsedSeconds = elapsed;
  const totalProgress = Math.min(96, Math.max(18, elapsedSeconds + 24));

  return (
    <div className="flex flex-col gap-1.5 py-1.5 max-w-[220px]">
      {hasHlsVideos &&
        qualities.map((q) => {
          let qStatus = "ready";
          let progressPercent = 100;

          if (
            ["pending", "queued", "uploading", "processing"].includes(status)
          ) {
            if (q === "360p") {
              qStatus = totalProgress > 44 ? "ready" : "processing";
              progressPercent =
                totalProgress > 44
                  ? 100
                  : Math.round((totalProgress / 44) * 100);
            } else if (q === "480p") {
              qStatus = totalProgress > 58 ? "ready" : "processing";
              progressPercent =
                totalProgress > 58
                  ? 100
                  : Math.round((totalProgress / 58) * 100);
            } else if (q === "720p") {
              qStatus = totalProgress > 74 ? "ready" : "processing";
              progressPercent =
                totalProgress > 74
                  ? 100
                  : Math.round((totalProgress / 74) * 100);
            } else {
              qStatus = totalProgress > 90 ? "ready" : "processing";
              progressPercent =
                totalProgress > 90
                  ? 100
                  : Math.round((totalProgress / 90) * 100);
            }
          } else if (status === "failed") {
            qStatus = "failed";
            progressPercent = 0;
          }

          const videoUrl = episode.videoUrls?.[q];

          return (
            <div
              key={q}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="w-10 font-bold text-[var(--admin-muted)] text-[11px]">
                {q}
              </span>
              <div className="relative h-1.5 flex-1 min-w-[60px] overflow-hidden rounded-full bg-[var(--admin-soft)]">
                {qStatus === "processing" && (
                  <div
                    className="h-full rounded-full bg-pink-500 animate-pulse transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                )}
                {qStatus === "ready" && (
                  <div className="h-full w-full rounded-full bg-emerald-500" />
                )}
                {qStatus === "failed" && (
                  <div className="h-full w-full rounded-full bg-rose-500" />
                )}
              </div>

              <span className="w-8 text-[10px] text-right font-bold text-[var(--admin-muted)]">
                {qStatus === "processing"
                  ? `${progressPercent}%`
                  : qStatus === "ready"
                    ? "Ready"
                    : "Failed"}
              </span>

              {videoUrl ? (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--admin-accent)] hover:text-pink-600 transition p-0.5 hover:bg-[var(--admin-soft)] rounded"
                  title={`Preview HLS ${q}`}
                >
                  <Eye size={13} />
                </a>
              ) : (
                <span className="text-[var(--admin-muted)] opacity-30 p-0.5 cursor-not-allowed">
                  <Eye size={13} />
                </span>
              )}
            </div>
          );
        })}

      {episode.hlsMasterUrl && (
        <div className="mt-1 flex items-center justify-between border-t border-[var(--admin-border)] pt-1 text-[10px] font-semibold text-[var(--admin-primary)]">
          <span>Master Playlist</span>
          <a
            href={episode.hlsMasterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--admin-accent)] hover:text-pink-600 transition p-0.5 hover:bg-[var(--admin-soft)] rounded"
            title="Preview Master HLS"
          >
            <Eye size={13} />
          </a>
        </div>
      )}

      {hasLangVideos && (
        <div className="mt-1.5 border-t border-[var(--admin-border)] pt-1.5 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-muted)]">
            Manual Videos
          </div>
          {languageVideos.map((vid, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span
                className="text-[10px] font-semibold text-slate-700 truncate max-w-[140px]"
                title={`${vid.language} (${vid.quality})`}
              >
                {vid.language} ({vid.quality})
              </span>
              <a
                href={vid.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--admin-accent)] hover:text-pink-600 transition p-0.5 hover:bg-[var(--admin-soft)] rounded"
                title={`Watch ${vid.language} ${vid.quality}`}
              >
                <Eye size={13} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatSpeed(bps) {
  if (bps >= 1024 * 1024) return `${(bps / 1024 / 1024).toFixed(1)} MB/s`;
  if (bps >= 1024) return `${(bps / 1024).toFixed(0)} KB/s`;
  return `${Math.round(bps)} B/s`;
}

function formatEta(sec) {
  if (!isFinite(sec) || sec <= 0) return "—";
  if (sec < 60) return `${Math.round(sec)}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
}

function CompactVideoUploader({
  langName,
  quality,
  existing,
  onFileChange,
  submitting,
}) {
  const [status, setStatus] = useState("idle"); // idle | uploading | paused | done | error | cancelled
  const [prog, setProg] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const controllerRef = useRef(null);
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    setFileName(file.name);
    setFileSize(file.size);
    setStatus("uploading");
    setProg(0);
    setSpeed(0);
    setEta(0);
    setErrorMsg("");

    const ctrl = createMultipartUpload(file, "episodes", (pct, bps, etaSec) => {
      setProg(pct);
      setSpeed(bps);
      setEta(etaSec);
    });
    controllerRef.current = ctrl;

    try {
      const result = await ctrl.promise;
      const duration = await readVideoDuration(file).catch(() => 0);
      onFileChange({
        url: result.url,
        key: result.key,
        size: file.size,
        duration,
        type: file.type,
      });
      setStatus("done");
    } catch (err) {
      if (err.message === "Upload cancelled") {
        setStatus("cancelled");
      } else {
        setStatus("error");
        setErrorMsg(err.message || "Upload failed");
      }
    } finally {
      controllerRef.current = null;
      // Reset the file input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handlePause = () => {
    controllerRef.current?.pause();
    setStatus("paused");
  };

  const handleResume = () => {
    controllerRef.current?.resume();
    setStatus("uploading");
  };

  const handleCancel = () => {
    controllerRef.current?.cancel();
    setStatus("cancelled");
    setProg(0);
  };

  const handleReset = () => {
    setStatus("idle");
    setProg(0);
    setSpeed(0);
    setEta(0);
    setFileName("");
    setErrorMsg("");
  };

  // ── Already uploaded ──────────────────────────────────────────────────────────
  if (existing?.videoUrl || existing?.url) {
    const urlVal = existing.videoUrl || existing.url;
    const keyVal = existing.videoKey || existing.key;
    return (
      <div className="flex flex-col gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-left w-full overflow-hidden">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
            {quality}
          </span>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="text-red-400 hover:text-red-600 p-0.5 rounded transition-colors"
            title="Remove"
          >
            <X size={13} />
          </button>
        </div>

        {/* Inline Playable Video Box */}
        <div className="relative rounded-lg overflow-hidden border border-emerald-100 dark:border-emerald-900 bg-black aspect-video w-full">
          <video
            src={urlVal}
            controls
            preload="metadata"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5 text-[9px]">
          <span
            className="text-emerald-600 dark:text-emerald-500 truncate max-w-[70%] font-mono"
            title={keyVal || urlVal}
          >
            {keyVal?.split("/").pop() || "uploaded.mp4"}
          </span>
          {existing.fileSize && (
            <span className="text-emerald-500 font-bold shrink-0">
              {(existing.fileSize / 1024 / 1024).toFixed(1)} MB
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Uploading / Paused ────────────────────────────────────────────────────────
  if (status === "uploading" || status === "paused") {
    const isPaused = status === "paused";
    return (
      <div className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 space-y-2.5">
        {/* File name + size */}
        <div className="flex items-center gap-1.5 min-w-0">
          <FileVideo size={13} className="shrink-0 text-blue-500" />
          <span
            className="text-[10px] font-bold text-[var(--admin-foreground)] truncate flex-1"
            title={fileName}
          >
            {fileName}
          </span>
          <span className="text-[9px] text-[var(--admin-muted)] shrink-0">
            {(fileSize / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span
              className={`text-[10px] font-black ${isPaused ? "text-amber-600" : "text-blue-600"}`}
            >
              {isPaused ? "⏸ Paused" : `Uploading`} — {prog}%
            </span>
          </div>
          <div className="h-2 w-full bg-[var(--admin-soft)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isPaused
                  ? "bg-amber-400"
                  : "bg-gradient-to-r from-blue-500 to-cyan-400"
              }`}
              style={{ width: `${prog}%` }}
            />
          </div>
        </div>

        {/* Speed + ETA */}
        {!isPaused && (
          <div className="flex items-center gap-3 text-[9px] text-[var(--admin-muted)]">
            <span className="flex items-center gap-0.5 font-bold text-[var(--admin-foreground)]">
              <Zap size={9} className="text-yellow-500" />
              {formatSpeed(speed)}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock size={9} />
              ETA: {formatEta(eta)}
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {isPaused ? (
            <button
              type="button"
              onClick={handleResume}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition"
            >
              <Play size={10} /> Resume
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold transition"
            >
              <Pause size={10} /> Pause
            </button>
          )}
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 text-[10px] font-bold transition"
          >
            <StopCircle size={10} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="w-full rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={13} className="text-red-500 shrink-0" />
          <span className="text-[10px] font-bold text-red-600">
            Upload Failed
          </span>
        </div>
        <p className="text-[9px] text-red-500 truncate" title={errorMsg}>
          {errorMsg}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold transition"
        >
          <RefreshCcw size={10} /> Retry
        </button>
      </div>
    );
  }

  // ── Cancelled ─────────────────────────────────────────────────────────────────
  if (status === "cancelled") {
    return (
      <div className="w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)] p-3 space-y-2 text-center">
        <p className="text-[10px] text-[var(--admin-muted)] font-semibold">
          Upload cancelled
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 mx-auto px-2.5 py-1 rounded-lg bg-[var(--admin-soft)] hover:bg-[var(--admin-border)] border border-[var(--admin-border)] text-[var(--admin-foreground)] text-[10px] font-bold transition"
        >
          <RefreshCcw size={10} /> Try Again
        </button>
      </div>
    );
  }

  // ── Idle (default) ────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        id={`upload-${langName}-${quality}`}
        onChange={handleFileSelect}
        className="hidden"
        disabled={submitting}
      />
      <label
        htmlFor={`upload-${langName}-${quality}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) uploadFile(file);
        }}
        className={cn(
          "flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-3 cursor-pointer text-xs font-bold transition-all duration-200 h-14 group",
          isDragOver 
            ? "border-blue-500 bg-blue-50/20 text-blue-600 animate-pulse" 
            : "border-[var(--admin-border)] hover:border-blue-500 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 text-[var(--admin-muted)] hover:text-blue-600"
        )}
      >
        <UploadCloud
          size={15}
          className={cn("shrink-0 transition-colors", isDragOver ? "text-blue-500" : "group-hover:text-blue-500")}
        />
        <span>Upload {quality}</span>
      </label>
    </div>
  );
}
function createSubtitleUpload(file, onProgress) {
  let currentXhr = null;
  let cancelled = false;
  let startTime = Date.now();
  
  const controller = {
    cancel() {
      cancelled = true;
      currentXhr?.abort();
    }
  };

  controller.promise = (async () => {
    const res = await fetch("/api/admin/upload/presigned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "text/plain",
        folder: "subtitles",
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to get upload URL");
    if (cancelled) throw new Error("Upload cancelled");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      currentXhr = xhr;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress(pct);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve({ url: data.url });
        } else {
          reject(new Error("S3 upload failed"));
        }
      };
      xhr.onerror = () => reject(new Error("S3 upload failed"));
      xhr.onabort = () => reject(new Error("Upload cancelled"));
      xhr.open("PUT", data.uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "text/plain");
      xhr.send(file);
    });
  })();

  return controller;
}

function CompactSubtitleUploader({ langName, existingUrl, onFileChange, submitting }) {
  const [status, setStatus] = useState(existingUrl ? "done" : "idle"); // idle | uploading | done | error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);
  const controllerRef = useRef(null);

  useEffect(() => {
    setStatus(existingUrl ? "done" : "idle");
  }, [existingUrl]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setProgress(0);
    setErrorMsg("");

    const ctrl = createSubtitleUpload(file, (pct) => {
      setProgress(pct);
    });
    controllerRef.current = ctrl;
    try {
      const result = await ctrl.promise;
      onFileChange(result.url);
      setStatus("done");
    } catch (err) {
      if (err.message === "Upload cancelled") {
        setStatus("idle");
      } else {
        setStatus("error");
        setErrorMsg(err.message || "Upload failed");
      }
    } finally {
      controllerRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    controllerRef.current?.cancel();
    setStatus("idle");
    setProgress(0);
  };

  const handleRemove = () => {
    onFileChange("");
    setStatus("idle");
  };

  if (status === "done" && existingUrl) {
    return (
      <div className="flex items-center justify-between gap-2 p-1 px-2.5 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/80 rounded-lg text-xs w-full max-w-[280px]">
        <span className="text-sky-700 dark:text-sky-400 font-medium truncate max-w-[200px]" title={existingUrl}>
          Uploaded SRT/VTT
        </span>
        <button
          type="button"
          onClick={handleRemove}
          className="text-red-400 hover:text-red-600 p-0.5 rounded transition-colors"
          title="Remove"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  if (status === "uploading") {
    return (
      <div className="flex items-center gap-2 w-full max-w-[280px] p-1.5 border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-lg">
        <div className="flex-1">
          <div className="w-full bg-[var(--admin-soft)] rounded-full h-1.5 overflow-hidden">
            <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="text-[10px] font-bold text-red-500 hover:text-red-600"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[280px]">
      <input
        ref={inputRef}
        type="file"
        accept=".srt,.vtt"
        id={`sub-upload-${langName}`}
        onChange={handleFileSelect}
        className="hidden"
        disabled={submitting}
      />
      <label
        htmlFor={`sub-upload-${langName}`}
        className="flex items-center justify-center gap-1.5 border border-dashed border-[var(--admin-border)] hover:border-sky-500 hover:bg-sky-50/10 dark:hover:bg-sky-950/10 rounded-lg p-2 cursor-pointer text-xs font-semibold text-[var(--admin-muted)] hover:text-sky-600 transition-all duration-200 h-8 group w-full"
      >
        <UploadCloud
          size={13}
          className="shrink-0 group-hover:text-sky-500 transition-colors"
        />
        <span>Upload Subtitle</span>
      </label>
    </div>
  );
}

function EpisodesView({
  data,
  loading,
  refresh,
  notify,
  selectedSeriesId,
  setSelectedSeriesId,
  selectedSeriesTitle,
  setSelectedSeriesTitle,
}) {
  const router = useRouter();
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editTab, setEditTab] = useState("video-assets"); // details, video-assets, subtitles, scheduling
  const [form, setForm] = useState({
    episodeNumber: "",
    title: "",
    description: "",
    duration: "",
    isDownloadable: false,
    isFree: false,
    isActive: true,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [languagesData, setLanguagesData] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [translatingFields, setTranslatingFields] = useState({});
  const translatingFieldsRef = useRef(new Set());
  const isFieldTranslating = (langName, fieldKey) =>
    Boolean(translatingFields[`${langName}_${fieldKey}`]);
  const lastSavedStateRef = useRef({ form: null, languagesData: null, thumbnailFile: null, videoFile: null });

  function isTabDirty(tabId) {
    const saved = lastSavedStateRef.current;
    if (!saved || !saved.form) return false;

    if (tabId === "details") {
      const fields = ["episodeNumber", "title", "description", "duration", "isDownloadable", "isFree"];
      const isFormChanged = fields.some(f => String(form[f] ?? "") !== String(saved.form[f] ?? ""));
      const isFileChanged = thumbnailFile !== saved.thumbnailFile;
      return isFormChanged || isFileChanged;
    }

    if (tabId === "video-assets") {
      if (languagesData.length !== saved.languagesData.length) return true;
      for (let i = 0; i < languagesData.length; i++) {
        const curr = languagesData[i];
        const prev = saved.languagesData[i];
        if (!prev) return true;
        if (curr.title !== prev.title) return true;
        if (curr.description !== prev.description) return true;
        if (curr.thumbnailUrl !== prev.thumbnailUrl) return true;
        
        const currVideos = curr.videoFiles || [];
        const prevVideos = prev.videoFiles || [];
        if (currVideos.length !== prevVideos.length) return true;
        for (let j = 0; j < currVideos.length; j++) {
          const cv = currVideos[j];
          const pv = prevVideos.find(f => f.quality === cv.quality);
          if (!pv) return true;
          if (cv.videoUrl !== pv.videoUrl || cv.videoKey !== pv.videoKey) return true;
        }
      }
      return false;
    }

    if (tabId === "subtitles") {
      if (languagesData.length !== saved.languagesData.length) return true;
      for (let i = 0; i < languagesData.length; i++) {
        const curr = languagesData[i];
        const prev = saved.languagesData[i];
        if (!prev) return true;
        if (curr.subtitleFile !== prev.subtitleFile) return true;
      }
      return false;
    }

    return false;
  }

  function isAnyTabDirty() {
    return isTabDirty("details") || isTabDirty("video-assets") || isTabDirty("subtitles");
  }

  const handleTranslateField = async (targetLang, fieldKey, localVal) => {
    const textToTranslate = String(localVal || "").trim();
    if (!textToTranslate) {
      notify("Please enter text in this field before auto-translating.", "error");
      return;
    }

    const fieldKeyId = `${targetLang}_${fieldKey}`;
    // Synchronous ref check prevents duplicate requests from rapid repeated clicks
    if (translatingFieldsRef.current.has(fieldKeyId)) {
      return;
    }

    translatingFieldsRef.current.add(fieldKeyId);
    setTranslatingFields((prev) => ({ ...prev, [fieldKeyId]: true }));
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToTranslate, targetLang }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.translatedText) {
        // ONLY update this specific field! Other fields remain completely untouched.
        updateLangField(targetLang, fieldKey, data.translatedText);
        notify(`${fieldKey === "title" ? "Title" : "Description"} translated to ${targetLang}!`);
      } else {
        // Graceful error handling (e.g. 429 rate limit or network error):
        // NEVER clear or overwrite the user's original text!
        const errMsg = data.message || `Could not translate ${fieldKey}. Original text kept.`;
        notify(errMsg, "error");
      }
    } catch (err) {
      console.error("Translation request error:", err);
      // Never clear original text on network failure
      notify("Network error during translation. Original text kept.", "error");
    } finally {
      translatingFieldsRef.current.delete(fieldKeyId);
      setTranslatingFields((prev) => {
        const next = { ...prev };
        delete next[fieldKeyId];
        return next;
      });
    }
  };
  // Redesign states
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [tabFilter, setTabFilter] = useState("all"); // all, published, draft, processing

  const seriesList = data?.series || [];
  const activeSeries = seriesList.find(
    (s) => (s._id || s.id) === selectedSeriesId,
  );
  const activeSeason = seasons.find(
    (s) => (s._id || s.id) === selectedSeasonId,
  );

  // Sync title when series selection changes
  useEffect(() => {
    if (selectedSeriesId && seriesList.length > 0) {
      const found = seriesList.find(
        (s) => (s._id || s.id) === selectedSeriesId,
      );
      if (found && found.title !== selectedSeriesTitle) {
        setSelectedSeriesTitle(found.title);
      }
    }
  }, [
    selectedSeriesId,
    seriesList,
    selectedSeriesTitle,
    setSelectedSeriesTitle,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlSeriesId = params.get("seriesId");
      const urlSeriesSlug = params.get("series");
      if (urlSeriesId && urlSeriesId !== selectedSeriesId) {
        setSelectedSeriesId(urlSeriesId);
      } else if (urlSeriesSlug && seriesList.length > 0) {
        const found = seriesList.find(s => s.slug === urlSeriesSlug || String(s.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-') === urlSeriesSlug);
        if (found && (found._id || found.id) !== selectedSeriesId) {
          setSelectedSeriesId(found._id || found.id);
        }
      }
    }
  }, [seriesList]);

  // Synchronize URL query params with selected series and season
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let changed = false;

      if (selectedSeriesId && seriesList.length > 0) {
        const found = seriesList.find(s => (s._id || s.id) === selectedSeriesId);
        if (found) {
          const slug = found.slug || String(found.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
          if (slug && url.searchParams.get("series") !== slug) {
            url.searchParams.set("series", slug);
            url.searchParams.delete("seriesId");
            changed = true;
          }
        }
      }

      if (selectedSeasonId && seasons.length > 0) {
        const found = seasons.find(s => (s._id || s.id) === selectedSeasonId);
        if (found) {
          const val = String(found.seasonNumber);
          if (url.searchParams.get("season") !== val) {
            url.searchParams.set("season", val);
            url.searchParams.delete("seasonId");
            changed = true;
          }
        }
      }

      if (changed) {
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  }, [selectedSeriesId, selectedSeasonId, seriesList, seasons]);

  async function loadSeasons() {
    if (!selectedSeriesId) {
      setSeasons([]);
      setSelectedSeasonId("");
      return;
    }
    try {
      const res = await apiFetch(
        `/api/admin/series/${selectedSeriesId}/seasons`,
      );
      setSeasons(res.seasons || []);

      let initialSeasonId = "";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlSeasonId = params.get("seasonId");
        const urlSeasonNum = params.get("season");
        
        if (urlSeasonId && res.seasons?.some((s) => (s._id || s.id) === urlSeasonId)) {
          initialSeasonId = urlSeasonId;
        } else if (urlSeasonNum) {
          const found = res.seasons?.find(s => String(s.seasonNumber) === String(urlSeasonNum));
          if (found) {
            initialSeasonId = found._id || found.id;
          }
        }
      }

      if (initialSeasonId) {
        setSelectedSeasonId(initialSeasonId);
      } else if (res.seasons?.length) {
        setSelectedSeasonId(res.seasons[0]._id || res.seasons[0].id);
      } else {
        setSelectedSeasonId("");
      }
    } catch (err) {
      notify(err.message, "error");
    }
  }

  useEffect(() => {
    setSelectedSeasonId("");
    setEpisodes([]);
    setSeasons([]);
    loadSeasons();
  }, [selectedSeriesId]);

  async function loadEpisodes() {
    if (!selectedSeriesId || !selectedSeasonId) {
      setEpisodes([]);
      return;
    }
    setLoadingEpisodes(true);
    try {
      const res = await apiFetch(
        `/api/admin/series/${selectedSeriesId}/seasons/${selectedSeasonId}/episodes`,
      );
      setEpisodes(res.episodes || []);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoadingEpisodes(false);
    }
  }

  useEffect(() => {
    if (selectedSeasonId) {
      loadEpisodes();
    } else {
      setEpisodes([]);
    }
  }, [selectedSeasonId]);

  // Poll for active transcoding status updates
  useEffect(() => {
    if (!selectedSeriesId || !selectedSeasonId) return;

    const hasActiveTranscoding = episodes.some((ep) =>
      ["pending", "queued", "uploading", "processing"].includes(
        ep.transcodingStatus,
      ),
    );

    if (!hasActiveTranscoding) return;

    const interval = setInterval(() => {
      apiFetch(
        `/api/admin/series/${selectedSeriesId}/seasons/${selectedSeasonId}/episodes`,
      )
        .then((res) => {
          if (res && res.episodes) {
            setEpisodes(res.episodes);
          }
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSeriesId, selectedSeasonId, episodes]);

  useEffect(() => {
    if (!open) return;
    const selectedSeries = seriesList.find(
      (s) => (s._id || s.id) === selectedSeriesId,
    );
    const seriesLanguages = Array.isArray(selectedSeries?.language)
      ? selectedSeries.language
      : typeof selectedSeries?.language === "string"
        ? selectedSeries.language
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        : [];

    const langs = seriesLanguages.length > 0 ? seriesLanguages : ["Default"];

    if (editing) {
      const existingLangsMap = new Map(
        (editing.languages || []).map((l) => [l.language, l]),
      );
      const nextLangsData = langs.map((langName) => {
        const existing = existingLangsMap.get(langName);
        return {
          language: langName,
          title: existing?.title || editing.title || "",
          description: existing?.description || editing.description || "",
          thumbnailUrl: existing?.thumbnailUrl || editing.thumbnailUrl || "",
          subtitleFile: existing?.subtitleFile || "",
          videoFiles: existing?.videoFiles || [],
        };
      });
      setLanguagesData(nextLangsData);
      setActiveTab(langs[0]);
      const initialForm = {
        episodeNumber: editing.episodeNumber || "",
        title: editing.title || (editing.episodeNumber ? `Episode ${editing.episodeNumber}` : ""),
        description: editing.description || "",
        thumbnailUrl: editing.thumbnailUrl || "",
        duration: editing.duration || "",
        airDate: editing.airDate
          ? new Date(editing.airDate).toISOString().split("T")[0]
          : "",
        isDownloadable:
          editing.isDownloadable === true || editing.isDownloadable === "true",
        isFree: editing.isFree === true || editing.isFree === "true",
        isActive: editing.isActive !== false,
      };
      setForm(initialForm);
      lastSavedStateRef.current = {
        form: initialForm,
        languagesData: JSON.parse(JSON.stringify(nextLangsData)),
        thumbnailFile: null,
        videoFile: null,
      };
    } else {
      const nextLangsData = langs.map((langName) => ({
        language: langName,
        title: "",
        description: "",
        thumbnailUrl: "",
        subtitleFile: "",
        videoFiles: [],
      }));
      setLanguagesData(nextLangsData);
      setActiveTab(langs[0]);
      const initialForm = {
        episodeNumber: episodes.length + 1,
        title: `Episode ${episodes.length + 1}`,
        description: "",
        thumbnailUrl: "",
        duration: "",
        isDownloadable: false,
        isFree: false,
        isActive: true,
      };
      setForm(initialForm);
      lastSavedStateRef.current = {
        form: initialForm,
        languagesData: JSON.parse(JSON.stringify(nextLangsData)),
        thumbnailFile: null,
        videoFile: null,
      };
    }
    setThumbnailFile(null);
    setVideoFile(null);
    setFormErrors({});
  }, [editing, open]);

  function setFormValue(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => {
      if (!current[key] && !current.form) return current;
      const next = { ...current };
      delete next[key];
      delete next.form;
      return next;
    });
  }

  const updateLangField = (langName, key, val) => {
    setLanguagesData((prev) =>
      prev.map((l) => (l.language === langName ? { ...l, [key]: val } : l)),
    );
  };

  const setLangQualityFile = (langName, quality, uploadData) => {
    setLanguagesData((prev) =>
      prev.map((l) => {
        if (l.language !== langName) return l;
        let files = l.videoFiles || [];
        if (!uploadData) {
          files = files.filter((f) => f.quality !== quality);
        } else {
          const idx = files.findIndex((f) => f.quality === quality);
          const newFile = {
            quality,
            videoUrl: uploadData.url,
            videoKey: uploadData.key,
            fileSize: uploadData.size,
            duration: uploadData.duration,
            mimeType: uploadData.type,
          };
          if (idx >= 0) files[idx] = newFile;
          else files.push(newFile);
        }
        return { ...l, videoFiles: files };
      }),
    );
  };

  const handleLangThumbnailUpload = async (langName, file) => {
    if (!file) {
      updateLangField(langName, "thumbnailUrl", "");
      return;
    }
    try {
      const res = await uploadToS3(file, "episode-thumbnails");
      updateLangField(langName, "thumbnailUrl", res.url);
    } catch (err) {
      notify(err.message || "Thumbnail upload failed", "error");
    }
  };

  function validateEpisodeForm() {
    const nextErrors = {};
    const episodeNumber = Number(form.episodeNumber);

    if (!Number.isInteger(episodeNumber) || episodeNumber <= 0) {
      nextErrors.episodeNumber = "Enter a whole number greater than 0.";
    }

    if (videoFile && !Number(form.duration)) {
      nextErrors.duration =
        "Duration will be detected from the selected video. Please choose a valid video file.";
    }

    const duplicate = episodes.find((episode) => {
      const sameNumber = Number(episode.episodeNumber) === episodeNumber;
      const sameEpisode =
        editing &&
        String(episode._id || episode.id) === String(editing._id || editing.id);
      return sameNumber && !sameEpisode;
    });

    if (duplicate) {
      nextErrors.episodeNumber = `Episode ${episodeNumber} already exists in this season.`;
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleEpisodeVideoFile(file) {
    setVideoFile(file || null);
    setFormErrors((current) => {
      const next = { ...current };
      delete next.duration;
      delete next.form;
      return next;
    });

    if (!file) {
      if (!editing) setFormValue("duration", "");
      return;
    }

    try {
      const duration = await readVideoDuration(file);
      setFormValue("duration", duration || "");
    } catch (error) {
      setFormValue("duration", "");
      setFormErrors((current) => ({
        ...current,
        duration: error.message || "Could not read video duration.",
      }));
    }
  }

  async function handleSubmit(e, forceActive, keepOpen = false) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!validateEpisodeForm()) return;
    setSubmitting(true);

    try {
      const fd = new FormData();
      const currentTitle = String(form.title || "").trim() || `Episode ${form.episodeNumber || 1}`;
      fd.append("title", currentTitle);
      fd.append("description", String(form.description || "").trim());
      const resolvedThumbUrl = thumbnailFile ? "" : (form.thumbnailUrl !== undefined ? form.thumbnailUrl : (editing?.thumbnailUrl || ""));
      fd.append("thumbnailUrl", resolvedThumbUrl);

      Object.entries(form).forEach(([key, val]) => {
        if (key === "isActive" || key === "title" || key === "description" || key === "thumbnailUrl") return;
        if (typeof val === "boolean") {
          fd.append(key, val ? "true" : "false");
        } else if (val !== undefined && val !== null) {
          fd.append(key, val);
        }
      });

      let activeVal = true;
      if (forceActive !== undefined) {
        activeVal = forceActive;
      } else if (form.isActive !== undefined) {
        activeVal = form.isActive;
      } else if (editing && editing.isActive !== undefined) {
        activeVal = editing.isActive;
      }
      fd.append("isActive", activeVal ? "true" : "false");
      if (thumbnailFile) fd.append("thumbnailImage", thumbnailFile);
      if (videoFile) fd.append("videoFile", videoFile);
      const validLangs = languagesData
        .filter(
          (l) =>
            String(l.title || "").trim() !== "" ||
            String(l.description || "").trim() !== "" ||
            (Array.isArray(l.videoFiles) && l.videoFiles.length > 0) ||
            Boolean(l.subtitleFile) ||
            Boolean(l.thumbnailUrl),
        )
        .map((l, idx) => ({
          ...l,
          title: String(l.title || "").trim() || currentTitle,
          thumbnailUrl: idx === 0 && (thumbnailFile || form.thumbnailUrl !== undefined) ? (thumbnailFile ? "" : (form.thumbnailUrl || "")) : (l.thumbnailUrl || ""),
        }));
      fd.append("languages", JSON.stringify(validLangs));

      const url = editing
        ? `/api/admin/series/${selectedSeriesId}/seasons/${selectedSeasonId}/episodes/${editing._id || editing.id}`
        : `/api/admin/series/${selectedSeriesId}/seasons/${selectedSeasonId}/episodes`;
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const payload = await readJsonResponse(res);
      if (!res.ok || !payload.success) {
        setFormErrors(
          payload.fields || { form: payload.message || "Saving failed" },
        );
        if (payload.fields) return;
        throw new Error(payload.message || "Saving failed");
      }

      notify(editing ? "Episode updated" : "Episode created");
      if (!keepOpen) {
        setOpen(false);
        setEditing(null);
      } else {
        setEditing(payload.episode);
      }
      loadEpisodes();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(episodeId) {
    const confirmed = await showConfirm("Are you sure you want to delete this episode?");
    if (!confirmed) return;
    try {
      const url = `/api/admin/series/${selectedSeriesId}/seasons/${selectedSeasonId}/episodes/${episodeId}`;
      await apiFetch(url, { method: "DELETE" });
      notify("Episode deleted");
      loadEpisodes();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  // Filter episodes
  const filteredEpisodes = episodes.filter((ep) => {
    if (tabFilter === "published") return ep.isActive !== false;
    if (tabFilter === "draft") return ep.isActive === false;
    if (tabFilter === "processing") {
      return ["pending", "queued", "uploading", "processing"].includes(
        ep.transcodingStatus,
      );
    }
    return true;
  });

  const totalEpisodesCount = episodes.length;
  const publishedEpisodesCount = episodes.filter(
    (ep) => ep.isActive !== false,
  ).length;
  const draftEpisodesCount = episodes.filter(
    (ep) => ep.isActive === false,
  ).length;
  const processingEpisodesCount = episodes.filter((ep) =>
    ["pending", "queued", "uploading", "processing"].includes(
      ep.transcodingStatus,
    ),
  ).length;

  if (open) {
    return (
      <PageShell>
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-[var(--admin-border)] px-5 py-4 gap-4 bg-[var(--admin-soft)]/20">
            <div>
              <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--admin-muted)] mb-1 font-bold">
                <span>{selectedSeriesTitle || "FROM"}</span>
                <ChevronRight size={12} />
                <span>Season {activeSeason?.seasonNumber || "1"}</span>
                <ChevronRight size={12} />
                <span className="text-[var(--admin-foreground)]">
                  Episode {form.episodeNumber}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-display text-[var(--admin-foreground)]">
                  {form.title || `Episode ${form.episodeNumber}`}
                </h2>
                <span
                  className={cn(
                    "rounded border px-2 py-0.5 text-[10px] font-black tracking-wider uppercase",
                    form.isActive !== false
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-amber-50 border-amber-200 text-amber-700",
                  )}
                >
                  {form.isActive !== false ? "PUBLISHED" : "DRAFT"}
                </span>
                <span className="text-xs text-[var(--admin-muted)] select-none">
                  Last saved recently
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isAnyTabDirty()) {
                    if (!confirm("You have unsaved changes. Are you sure you want to discard them?")) {
                      return;
                    }
                  }
                  setOpen(false);
                  setEditing(null);
                }}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={(e) => {
                  setForm((prev) => ({ ...prev, isActive: false }));
                  handleSubmit(e, false);
                }}
                className="h-9 text-xs"
              >
                Save Draft
              </Button>
              <Button
                onClick={(e) => {
                  setForm((prev) => ({ ...prev, isActive: true }));
                  handleSubmit(e, true);
                }}
                disabled={submitting}
                className="h-9 bg-[var(--admin-accent)] hover:brightness-95 text-white text-xs font-bold px-4 rounded"
              >
                {submitting ? "Saving..." : "Publish Episode"}
              </Button>
            </div>
          </div>

          {/* Subheader tabs */}
          <div className="flex border-b border-[var(--admin-border)] px-5 gap-4 overflow-x-auto bg-[var(--admin-surface)]">
            {[
              { id: "details", label: "Details" },
              { id: "video-assets", label: "Video Assets" },
              { id: "subtitles", label: "Subtitles" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setEditTab(tab.id);
                }}
                className={cn(
                  "py-3 text-xs font-bold relative border-b-2 transition-colors",
                  editTab === tab.id
                    ? "border-[var(--admin-accent)] text-[var(--admin-accent)]"
                    : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Workspace Body */}
          <div className="p-6">
            {formErrors.form && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                {formErrors.form}
              </div>
            )}

            {/* TAB 1: Details */}
            {editTab === "details" && (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block mb-1">
                      Episode Number
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={form.episodeNumber}
                      onChange={(e) =>
                        setFormValue("episodeNumber", e.target.value)
                      }
                      className={
                        formErrors.episodeNumber
                          ? "border-red-400 focus:border-red-500"
                          : ""
                      }
                      required
                    />
                    {formErrors.episodeNumber && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {formErrors.episodeNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block mb-1">
                      Duration (seconds)
                    </label>
                    <Input
                      type="number"
                      value={form.duration}
                      onChange={(e) => setFormValue("duration", e.target.value)}
                      placeholder="Will auto-detect from video if blank"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm font-semibold select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isDownloadable}
                        onChange={(e) =>
                          setFormValue("isDownloadable", e.target.checked)
                        }
                        className="rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-0"
                      />
                      <span>Downloadable</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFree}
                        onChange={(e) =>
                          setFormValue("isFree", e.target.checked)
                        }
                        className="rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-0"
                      />
                      <span>Free Episode</span>
                    </label>
                  </div>

                  {/* Admin subscription rule reminder */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[var(--admin-muted)] bg-[var(--admin-soft)]/60 p-2.5 rounded-lg border border-[var(--admin-border)]">
                    <div className="flex items-start gap-1.5">
                      <span className="font-semibold text-[var(--admin-foreground)] shrink-0">📥 Downloadable:</span>
                      <span>Active subscribed users can download this video for offline viewing.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-semibold text-[var(--admin-foreground)] shrink-0">🎟️ Free Episode:</span>
                      <span>Free for all users. If unchecked, an active subscription is required to watch.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--admin-border)]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block mb-2">
                    Default Thumbnail
                  </h4>
                  <div className="max-w-md">
                    <ImageUploadField
                      label="Thumbnail Image"
                      currentUrl={form.thumbnailUrl !== undefined ? form.thumbnailUrl : editing?.thumbnailUrl}
                      file={thumbnailFile}
                      onFileChange={(f) => {
                        setThumbnailFile(f);
                        if (f) setFormValue("thumbnailUrl", "");
                      }}
                      onClear={() => {
                        setThumbnailFile(null);
                        setFormValue("thumbnailUrl", "");
                        if (editing) editing.thumbnailUrl = "";
                        setLanguagesData((prev) =>
                          prev.map((l, idx) => (idx === 0 ? { ...l, thumbnailUrl: "" } : l))
                        );
                      }}
                      aspectRatio="16/9"
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 mt-6 border-t border-[var(--admin-border)]">
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => handleSubmit(e, undefined, true)}
                    className="bg-[var(--admin-accent)] hover:brightness-95 text-white text-xs font-bold px-4 h-9 rounded"
                  >
                    {submitting ? "Saving Details..." : "Save Details"}
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 2: Video Assets Matrix */}
            {editTab === "video-assets" && (
              <div className="flex flex-col xl:flex-row gap-6 min-h-0">
                {/* Left Column: Info card */}
                <div className="w-full xl:w-72 shrink-0 bg-[var(--admin-soft)]/20 border border-[var(--admin-border)] p-4 rounded-xl space-y-4 self-start">
                  <div className="aspect-[16/9] w-full rounded-lg overflow-hidden border border-[var(--admin-border)] bg-[var(--admin-soft)] shadow-inner relative">
                    {thumbnailFile || editing?.thumbnailUrl || activeSeries?.posterUrl ? (
                      <img
                        src={
                          thumbnailFile
                            ? URL.createObjectURL(thumbnailFile)
                            : editing?.thumbnailUrl || activeSeries?.posterUrl
                        }
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PlayCircle className="h-full w-full p-12 text-[var(--admin-muted)]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--admin-foreground)]">
                      Episode Info
                    </h3>
                    <div className="mt-3 space-y-2 text-xs border-t border-[var(--admin-border)] pt-3">
                      <div className="flex justify-between">
                        <span className="text-[var(--admin-muted)]">
                          Series
                        </span>
                        <span className="font-semibold">
                          {selectedSeriesTitle || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--admin-muted)]">
                          Season
                        </span>
                        <span className="font-semibold">
                          Season {activeSeason?.seasonNumber || "1"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--admin-muted)]">
                          Episode Number
                        </span>
                        <span className="font-semibold">
                          {form.episodeNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--admin-muted)]">Title</span>
                        <span
                          className="font-semibold truncate max-w-[140px]"
                          title={form.title}
                        >
                          {form.title || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--admin-muted)]">
                          Duration
                        </span>
                        <span className="font-semibold">
                          {form.duration
                            ? formatDurationLabel(form.duration)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setEditTab("details")}
                    className="w-full bg-[var(--admin-soft)] hover:bg-[var(--admin-border)] border border-[var(--admin-border)] text-[var(--admin-foreground)] h-9 text-xs font-bold"
                  >
                    Edit Details
                  </Button>
                </div>

                {/* Right Column: Video matrix table */}
                <div className="flex-1 space-y-4">
                  <div className="border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-[var(--admin-border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[var(--admin-soft)]/20">
                      <div>
                        <h3 className="font-bold text-sm text-[var(--admin-foreground)] leading-none">
                          Video Assets
                        </h3>
                        <p className="text-xs text-[var(--admin-muted)] mt-1">
                          Upload video files for different languages and quality
                          presets.
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-semibold text-[var(--admin-muted)] mr-1">
                          Quality Presets:
                        </span>
                        {["4K", "1080P", "720P", "480P", "360P"].map((q) => (
                          <span
                            key={q}
                            className="bg-[var(--admin-soft)] border border-[var(--admin-border)] px-2 py-0.5 rounded text-[10px] font-bold text-[var(--admin-foreground)] select-none"
                          >
                            {q}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Language variants sub-tabs */}
                      <div className="flex border-b border-[var(--admin-border)] gap-1 mb-2">
                        {languagesData.map((lang) => (
                          <button
                            key={lang.language}
                            type="button"
                            onClick={() => setActiveTab(lang.language)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-bold rounded-t-md transition-colors border-t border-x",
                              activeTab === lang.language
                                ? "bg-[var(--admin-soft)] border-[var(--admin-border)] text-[var(--admin-accent)] border-b-transparent font-black"
                                : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]",
                            )}
                          >
                            {lang.language}
                          </button>
                        ))}
                      </div>

                      {/* Tab content quality columns uploader */}
                      {languagesData.map((lang) => {
                        if (lang.language !== activeTab) return null;
                        const qualities = [
                          "4k",
                          "1080p",
                          "720p",
                          "480p",
                          "360p",
                        ];
                        return (
                          <div key={lang.language} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-muted)] block">
                                    Title ({lang.language})
                                  </label>
                                  {(() => {
                                    const isTitleEmpty = !lang.title || !String(lang.title).trim();
                                    const isTitleTranslating = isFieldTranslating(lang.language, "title");
                                    return (
                                      <button
                                        type="button"
                                        disabled={isTitleEmpty || isTitleTranslating}
                                        onClick={() => handleTranslateField(lang.language, "title", lang.title)}
                                        className={cn(
                                          "text-[10px] font-semibold transition-colors inline-flex items-center gap-1",
                                          isTitleEmpty || isTitleTranslating
                                            ? "text-[var(--admin-muted)]/50 cursor-not-allowed opacity-50"
                                            : "text-pink-500 hover:text-pink-600 cursor-pointer"
                                        )}
                                        title={
                                          isTitleEmpty
                                            ? "Enter text in Title field to enable translation"
                                            : isTitleTranslating
                                              ? "Translating title..."
                                              : `Auto-translate Title to ${lang.language}`
                                        }
                                      >
                                        {isTitleTranslating ? (
                                          <>
                                            <Loader2 size={11} className="animate-spin" />
                                            <span>Translating...</span>
                                          </>
                                        ) : (
                                          "✨ Auto-Translate"
                                        )}
                                      </button>
                                    );
                                  })()}
                                </div>
                                <Input
                                  value={lang.title}
                                  onChange={(e) =>
                                    updateLangField(
                                      lang.language,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Localized Title for this language variant"
                                  className="h-9 text-xs"
                                />
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--admin-muted)] block">
                                    Description ({lang.language})
                                  </label>
                                  {(() => {
                                    const isDescEmpty = !lang.description || !String(lang.description).trim();
                                    const isDescTranslating = isFieldTranslating(lang.language, "description");
                                    return (
                                      <button
                                        type="button"
                                        disabled={isDescEmpty || isDescTranslating}
                                        onClick={() => handleTranslateField(lang.language, "description", lang.description)}
                                        className={cn(
                                          "text-[10px] font-semibold transition-colors inline-flex items-center gap-1",
                                          isDescEmpty || isDescTranslating
                                            ? "text-[var(--admin-muted)]/50 cursor-not-allowed opacity-50"
                                            : "text-pink-500 hover:text-pink-600 cursor-pointer"
                                        )}
                                        title={
                                          isDescEmpty
                                            ? "Enter text in Description field to enable translation"
                                            : isDescTranslating
                                              ? "Translating description..."
                                              : `Auto-translate Description to ${lang.language}`
                                        }
                                      >
                                        {isDescTranslating ? (
                                          <>
                                            <Loader2 size={11} className="animate-spin" />
                                            <span>Translating...</span>
                                          </>
                                        ) : (
                                          "✨ Auto-Translate"
                                        )}
                                      </button>
                                    );
                                  })()}
                                </div>
                                <Input
                                  value={lang.description}
                                  onChange={(e) =>
                                    updateLangField(
                                      lang.language,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Localized Synopsis for this language variant"
                                  className="h-9 text-xs"
                                />
                              </div>
                            </div>



                            <div className="space-y-3 pt-3 border-t border-[var(--admin-border)]">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--admin-foreground)]">
                                Video Quality Matrix
                              </h4>
                              <div className="overflow-x-auto border border-[var(--admin-border)] rounded-lg">
                                <table className="w-full text-xs text-left">
                                  <thead>
                                    <tr className="bg-[var(--admin-soft)] border-b border-[var(--admin-border)] text-[var(--admin-muted)] font-bold">
                                      <th className="px-4 py-2 w-32">
                                        Quality
                                      </th>
                                      <th className="px-4 py-2">
                                        Uploader / File details
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {qualities.map((q) => {
                                      const existing = (
                                        lang.videoFiles || []
                                      ).find((f) => f.quality === q);
                                      return (
                                        <tr
                                          key={q}
                                          className="border-b border-[var(--admin-border)] last:border-b-0"
                                        >
                                          <td className="px-3 py-3 font-bold uppercase text-[var(--admin-muted)] text-[11px] align-top w-20">
                                            {q}
                                          </td>
                                          <td className="px-3 py-2 w-full">
                                            <CompactVideoUploader
                                              langName={lang.language}
                                              quality={q}
                                              existing={existing}
                                              onFileChange={(uploadData) =>
                                                setLangQualityFile(
                                                  lang.language,
                                                  q,
                                                  uploadData,
                                                )
                                              }
                                              submitting={submitting}
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend / Info */}
                    <div className="px-5 py-3.5 border-t border-[var(--admin-border)] bg-[var(--admin-soft)]/20 flex flex-wrap gap-4 text-[10px] font-bold text-[var(--admin-muted)]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                        <span>Uploaded</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />
                        <span>Uploading</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--admin-border)] block" />
                        <span>Missing quality</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 mt-6 border-t border-[var(--admin-border)]">
                    <Button
                      type="button"
                      disabled={submitting}
                      onClick={(e) => handleSubmit(e, undefined, true)}
                      className="bg-[var(--admin-accent)] hover:brightness-95 text-white text-xs font-bold px-4 h-9 rounded"
                    >
                      {submitting ? "Saving Video Assets..." : "Save Video Assets"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Subtitles */}
            {editTab === "subtitles" && (
              <div className="max-w-2xl bg-[var(--admin-soft)]/10 border border-[var(--admin-border)] p-5 rounded-xl text-center space-y-4">
                <Globe
                  size={32}
                  className="mx-auto text-[var(--admin-muted)]"
                />
                <div>
                  <h3 className="font-bold text-base text-[var(--admin-foreground)]">
                    Subtitle Management
                  </h3>
                  <p className="text-xs text-[var(--admin-muted)] mt-1.5">
                    Upload SRT or VTT subtitle translation files for localized
                    versions of this episode.
                  </p>
                </div>
                <div className="p-4 bg-[var(--admin-surface)] rounded-lg border border-[var(--admin-border)] space-y-3 max-w-md mx-auto">
                  {languagesData.map((lang) => (
                    <div
                      key={lang.language}
                      className="flex items-center justify-between text-xs pb-3 border-b border-[var(--admin-border)] last:border-b-0 last:pb-0"
                    >
                      <span className="font-bold">{lang.language}</span>
                      <CompactSubtitleUploader
                        langName={lang.language}
                        existingUrl={lang.subtitleFile}
                        onFileChange={(url) =>
                          updateLangField(
                            lang.language,
                            "subtitleFile",
                            url,
                          )
                        }
                        submitting={submitting}
                      />                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-4 mt-6 border-t border-[var(--admin-border)]">
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => handleSubmit(e, undefined, true)}
                    className="bg-[var(--admin-accent)] hover:brightness-95 text-white text-xs font-bold px-4 h-9 rounded"
                  >
                    {submitting ? "Saving Subtitles..." : "Save Subtitles"}
                  </Button>
                </div>
              </div>
            )}


          </div>
        </div>
      </PageShell>
    );
  }

  // Standard listing view
  return (
    <PageShell>
      {/* 1. Selector controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-[var(--admin-surface)] p-4 rounded-xl border border-[var(--admin-border)] shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--admin-muted)] shrink-0">
              Series
            </span>
            <div className="relative flex items-center bg-[var(--admin-soft)] rounded-lg px-3 py-1.5 border border-[var(--admin-border)] min-w-[200px]">
              {activeSeries &&
                (activeSeries.posterUrl || activeSeries.thumbnailUrl) && (
                  <img
                    src={activeSeries.posterUrl || activeSeries.thumbnailUrl}
                    alt=""
                    className="h-6 w-5 object-cover rounded mr-2 shrink-0"
                  />
                )}
              <Select
                value={selectedSeriesId}
                onChange={(e) => setSelectedSeriesId(e.target.value)}
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-[var(--admin-foreground)] cursor-pointer pr-8 w-full"
              >
                <option value="">-- Choose Series --</option>
                {seriesList.map((series) => (
                  <option
                    key={series._id || series.id}
                    value={series._id || series.id}
                  >
                    {series.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {selectedSeriesId && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--admin-muted)] shrink-0">
                Season
              </span>
              <div className="relative flex items-center bg-[var(--admin-soft)] rounded-lg px-3 py-1.5 border border-[var(--admin-border)] min-w-[120px]">
                <Select
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-[var(--admin-foreground)] cursor-pointer pr-8 w-full"
                >
                  {seasons.map((season) => (
                    <option
                      key={season._id || season.id}
                      value={season._id || season.id}
                    >
                      Season {season.seasonNumber}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Action Counters / Telemetry KPI cards */}
        {selectedSeriesId && selectedSeasonId && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:justify-end shrink-0">
            <div className="hidden lg:flex items-center gap-4 bg-[var(--admin-soft)]/30 border border-[var(--admin-border)] px-4 py-2 rounded-xl text-xs shrink-0">
              <div className="flex items-center gap-1.5 pr-3 border-r border-[var(--admin-border)]">
                <Film size={14} className="text-[var(--admin-accent)]" />
                <span className="font-bold text-[var(--admin-foreground)]">
                  {totalEpisodesCount}
                </span>
                <span className="text-[var(--admin-muted)]">Episodes</span>
              </div>
              <div className="flex items-center gap-1.5 pr-3 border-r border-[var(--admin-border)]">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="font-bold text-[var(--admin-foreground)]">
                  {publishedEpisodesCount}
                </span>
                <span className="text-[var(--admin-muted)]">Published</span>
              </div>
              <div className="flex items-center gap-1.5 pr-3 border-r border-[var(--admin-border)]">
                <XCircle size={14} className="text-amber-500" />
                <span className="font-bold text-[var(--admin-foreground)]">
                  {draftEpisodesCount}
                </span>
                <span className="text-[var(--admin-muted)]">Draft</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCcw
                  size={13}
                  className="text-blue-500 animate-spin-slow"
                />
                <span className="font-bold text-[var(--admin-foreground)]">
                  {processingEpisodesCount}
                </span>
                <span className="text-[var(--admin-muted)]">Processing</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Button
                onClick={() => {
                  const seriesSlug = activeSeries?.slug || String(activeSeries?.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  router.push(
                    `/admin/bulk-episodes?series=${seriesSlug}&season=${activeSeason?.seasonNumber || 1}`,
                  );
                }}
                className="bg-[var(--admin-soft)] hover:bg-[var(--admin-border)] border border-[var(--admin-border)] text-[var(--admin-foreground)] h-9 text-xs font-bold px-3 flex items-center gap-1.5 shrink-0"
              >
                Bulk Upload
              </Button>
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                className="bg-[var(--admin-accent)] hover:brightness-95 text-white flex items-center gap-1.5 text-xs font-bold h-9 px-3 shrink-0"
              >
                <Plus size={16} /> Add Episode
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedSeriesId && selectedSeasonId ? (
        <div className="space-y-6">
          {/* 2. Subheader tabs & Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--admin-border)] pb-2">
            <div className="flex gap-4 overflow-x-auto">
              {[
                { id: "all", label: "All Episodes", count: totalEpisodesCount },
                {
                  id: "published",
                  label: "Published",
                  count: publishedEpisodesCount,
                },
                { id: "draft", label: "Draft", count: draftEpisodesCount },
                {
                  id: "processing",
                  label: "Processing",
                  count: processingEpisodesCount,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTabFilter(tab.id)}
                  className={cn(
                    "pb-3 text-xs font-bold relative border-b-2 transition-colors flex items-center gap-1.5 shrink-0",
                    tabFilter === tab.id
                      ? "border-[var(--admin-accent)] text-[var(--admin-accent)] font-black"
                      : "border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]",
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full",
                      tabFilter === tab.id
                        ? "bg-[var(--admin-accent)] text-white"
                        : "bg-[var(--admin-soft)] text-[var(--admin-muted)]",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Grid/List View Toggles */}
              <div className="flex items-center border border-[var(--admin-border)] rounded-lg overflow-hidden bg-[var(--admin-surface)] h-9 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-md transition",
                    viewMode === "grid"
                      ? "bg-[var(--admin-soft)] text-[var(--admin-accent)]"
                      : "text-[var(--admin-muted)]",
                  )}
                  title="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded-md transition",
                    viewMode === "list"
                      ? "bg-[var(--admin-soft)] text-[var(--admin-accent)]"
                      : "text-[var(--admin-muted)]",
                  )}
                  title="List View"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Main content */}
          {loadingEpisodes ? (
            <EpisodesSkeletonGrid />
          ) : filteredEpisodes.length === 0 ? (
            <EmptyState
              icon={PlayCircle}
              title="No episodes found"
              description="Create an episode to add video content to this season."
            />
          ) : viewMode === "grid" ? (
            /* REDESIGNED GRID CARD LIST */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredEpisodes.map((episode) => {
                const isPublished = episode.isActive !== false;
                const coverUrl =
                  episode.thumbnailUrl ||
                  activeSeries?.posterUrl ||
                  activeSeries?.thumbnailUrl;

                // Analytics details for this card
                const langsCount = activeSeries?.language?.length || 1;
                const totalVideoAssets = langsCount * 5; // 5 qualities
                const uploadedVideoAssets =
                  episode.languages?.reduce(
                    (acc, lang) => acc + (lang.videoFiles?.length || 0),
                    0,
                  ) || 0;
                const uploadedSubtitles =
                  episode.languages?.filter((lang) => lang.subtitleFile)
                    .length || 0;

                const videoColorClass =
                  uploadedVideoAssets === totalVideoAssets
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : uploadedVideoAssets > 0
                      ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800"
                      : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-800";

                const subColorClass =
                  uploadedSubtitles === langsCount
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : uploadedSubtitles > 0
                      ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800"
                      : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-800";

                return (
                  <div
                    key={episode._id || episode.id}
                    className="group flex flex-col bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] overflow-hidden shadow-sm hover:shadow-md transition duration-300"
                  >
                    {/* Thumbnail banner area */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--admin-soft)] shadow-inner">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-102 transition duration-500"
                        />
                      ) : (
                        <PlayCircle className="h-full w-full p-12 text-[var(--admin-muted)]" />
                      )}

                      {/* Overlays */}
                      <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-md border border-white/10 shadow-md">
                        {episode.episodeNumber}
                      </div>

                      <div
                        className={cn(
                          "absolute top-2.5 right-2.5 backdrop-blur-md text-[10px] font-black px-2.5 py-0.8 rounded-md tracking-wider border",
                          isPublished
                            ? "bg-emerald-950/85 border-emerald-500/50 text-emerald-400"
                            : "bg-amber-950/85 border-amber-500/50 text-amber-400",
                        )}
                      >
                        {isPublished ? "PUBLISHED" : "DRAFT"}
                      </div>

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-white text-xs font-black uppercase tracking-wider backdrop-blur-[1px]">
                        {selectedSeriesTitle || "FROM"} • Episode{" "}
                        {episode.episodeNumber}
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className="font-bold text-sm text-[var(--admin-foreground)] truncate flex-1"
                            title={episode.title}
                          >
                            {episode.title}
                          </h4>

                          {/* Options dropdown menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-7 w-7 rounded-md hover:bg-[var(--admin-soft)] text-[var(--admin-muted)] flex items-center justify-center transition">
                                <MoreHorizontal size={15} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-36 bg-[var(--admin-surface)] border-[var(--admin-border)]"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditing(episode);
                                  setEditTab("details");
                                  setOpen(true);
                                }}
                                className="text-xs font-semibold cursor-pointer"
                              >
                                <Pencil size={13} className="mr-2" /> Edit
                                Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDelete(episode._id || episode.id)
                                }
                                className="text-xs font-semibold text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer"
                              >
                                <Trash2 size={13} className="mr-2" /> Delete
                                Episode
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Specs */}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[var(--admin-muted)] font-semibold">
                          <span>
                            Duration:{" "}
                            {episode.duration
                              ? episode.duration < 60
                                ? `${Math.round(episode.duration)}s`
                                : `${Math.floor(episode.duration / 60)} min`
                              : "-"}
                          </span>

                        </div>
                      </div>

                      {/* localized variants details panel */}
                      <div className="space-y-1.5 pt-2 border-t border-[var(--admin-border)] text-[10px] font-bold text-[var(--admin-muted)]">
                        <div className="flex justify-between items-center bg-[var(--admin-soft)]/40 p-1.5 rounded-lg border border-[var(--admin-border)]">
                          <span>Languages</span>
                          <span className="bg-[var(--admin-muted)]/20 text-[var(--admin-foreground)] px-2 py-0.5 rounded font-black">
                            {langsCount}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex justify-between items-center p-1.5 rounded-lg border",
                            videoColorClass,
                          )}
                        >
                          <span>Video Assets</span>
                          <span className="font-black px-2 py-0.5 rounded bg-white/40 dark:bg-black/20">
                            {uploadedVideoAssets}/{totalVideoAssets}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex justify-between items-center p-1.5 rounded-lg border",
                            subColorClass,
                          )}
                        >
                          <span>Subtitles</span>
                          <span className="font-black px-2 py-0.5 rounded bg-white/40 dark:bg-black/20">
                            {uploadedSubtitles}/{langsCount}
                          </span>
                        </div>
                      </div>

                      {/* Manage Button */}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(episode);
                          setOpen(true);
                        }}
                        className="w-full mt-2 border-[var(--admin-accent)] text-[var(--admin-accent)] hover:bg-[var(--admin-soft)] flex items-center justify-center gap-1 text-xs font-bold py-1.5 rounded-lg transition"
                      >
                        Manage Episode <ChevronRight size={13} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* REDESIGNED TABLE LIST VIEW */
            <div className="border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-xs text-left">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-soft)]/15 text-[var(--admin-muted)] uppercase tracking-wider font-bold">
                      <th className="px-5 py-3 w-16 text-center">Ep #</th>
                      <th className="px-5 py-3">Episode title</th>
                      <th className="px-5 py-3 w-28">Duration</th>
                      <th className="px-5 py-3 w-48">Status / Quality</th>
                      <th className="px-5 py-3 w-28 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEpisodes.map((episode) => (
                      <tr
                        key={episode._id || episode.id}
                        className="border-b border-[var(--admin-border)] last:border-b-0 hover:bg-[var(--admin-soft)]/40 transition duration-150"
                      >
                        <td className="px-5 py-4 font-black text-center text-sm text-[var(--admin-muted)]">
                          {episode.episodeNumber}
                        </td>
                        <td className="px-5 py-4 font-semibold flex items-center gap-3">
                          <div className="grid h-9 w-14 shrink-0 place-items-center overflow-hidden rounded-md bg-[var(--admin-soft)] border border-[var(--admin-border)] shadow-inner">
                            {episode.thumbnailUrl ? (
                              <img
                                src={episode.thumbnailUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <PlayCircle
                                className="text-[var(--admin-primary)]"
                                size={16}
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-sm text-[var(--admin-foreground)]">
                                {episode.title}
                              </p>
                              {episode.isFree && (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-200 uppercase">
                                  Free
                                </span>
                              )}
                              {episode.isDownloadable && (
                                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 border border-blue-200 uppercase">
                                  DL
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--admin-muted)] max-w-sm truncate mt-0.5 font-normal">
                              {episode.description ||
                                "No description provided."}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {episode.duration
                            ? episode.duration < 60
                              ? `${Math.round(episode.duration)}s`
                              : `${Math.floor(episode.duration / 60)}m ${Math.round(episode.duration % 60)}s`
                            : "-"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <StatusBadge
                              status={displayEpisodeUploadStatus(
                                episode.transcodingStatus,
                              )}
                            />
                            <EpisodeQualitiesList episode={episode} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              title="Watch Episode"
                            >
                              <a
                                href={`/admin/watch/${episode._id || episode.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye size={15} className="text-blue-500" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditing(episode);
                                setEditTab("details");
                                setOpen(true);
                              }}
                              title="Edit Episode"
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDelete(episode._id || episode.id)
                              }
                              className="text-red-500 hover:text-red-600"
                              title="Delete Episode"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Tv}
          title="Select a series and season"
          description="Choose options from dropdowns above to list episodes."
        />
      )}
    </PageShell>
  );
}

function BulkEpisodesView({
  data,
  loading,
  refresh,
  notify,
  selectedSeriesId,
  setSelectedSeriesId,
  selectedSeriesTitle,
  setSelectedSeriesTitle,
}) {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [languagesList, setLanguagesList] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState("episodes"); // episodes, queue, preview, csv
  const [selectedLanguages, setSelectedLanguages] = useState(["English"]);
  const [activeQualities, setActiveQualities] = useState(["1080p", "720p"]);
  const [episodeRows, setEpisodeRows] = useState([]);
  const [existingEpisodes, setExistingEpisodes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedEpisodeId, setExpandedEpisodeId] = useState(null);
  const [queueFilter, setQueueFilter] = useState("all");
  const [previewVideoData, setPreviewVideoData] = useState(null);
  const [rowActiveLangs, setRowActiveLangs] = useState({}); // { [rowId]: langName }

  // Cell uploads tracking state
  const [cellUploads, setCellUploads] = useState({}); // { [cellKey]: { progress, status, fileName, fileSize, speed, eta, error, rowId, lang, quality, type, file } }
  const [uploadTarget, setUploadTarget] = useState(null);
  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);
  const uploadControllersRef = useRef({});

  // Sync Series Languages
  const seriesList = data?.series || [];
  const activeSeries = seriesList.find(
    (s) => (s._id || s.id) === selectedSeriesId,
  );
  const activeSeason = seasons.find(
    (s) => (s._id || s.id) === selectedSeasonId,
  );

  const seriesLanguages = React.useMemo(() => {
    if (!activeSeries) return [];
    return Array.isArray(activeSeries.language)
      ? activeSeries.language
      : typeof activeSeries.language === "string"
        ? activeSeries.language
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        : [];
  }, [activeSeries]);

  useEffect(() => {
    if (seriesLanguages.length > 0) {
      setSelectedLanguages(seriesLanguages);
    } else {
      setSelectedLanguages(["English"]);
    }
  }, [seriesLanguages]);

  const presets = ["4k", "1080p", "720p", "480p", "360p"];

  // Load languages list
  useEffect(() => {
    fetch("/api/languages")
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setLanguagesList(d.languages || []);
      })
      .catch(console.error);
  }, []);

  // Load seasons
  useEffect(() => {
    let cancelled = false;
    async function loadSeasons() {
      if (!selectedSeriesId) {
        setTimeout(() => {
          if (!cancelled) {
            setSeasons([]);
            setSelectedSeasonId("");
            setExistingEpisodes([]);
          }
        }, 0);
        return;
      }
      try {
        const res = await apiFetch(
          `/api/admin/series/${selectedSeriesId}/seasons`,
        );
        if (cancelled) return;
        setSeasons(res.seasons || []);
        let initialSeasonId = "";
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const urlSeasonId = params.get("seasonId");
          const urlSeasonNum = params.get("season");
          
          if (urlSeasonId && res.seasons?.some((s) => (s._id || s.id) === urlSeasonId)) {
            initialSeasonId = urlSeasonId;
          } else if (urlSeasonNum) {
            const found = res.seasons?.find(s => String(s.seasonNumber) === String(urlSeasonNum));
            if (found) {
              initialSeasonId = found._id || found.id;
            }
          }
        }
        
        if (initialSeasonId) {
          setSelectedSeasonId(initialSeasonId);
        } else if (res.seasons?.length) {
          setSelectedSeasonId(res.seasons[0]._id || res.seasons[0].id);
        } else {
          setSelectedSeasonId("");
        }
      } catch (err) {
        if (!cancelled) notify(err.message, "error");
      }
    }
    loadSeasons();
    return () => {
      cancelled = true;
    };
  }, [selectedSeriesId]);

  // Synchronize URL query params with selected series and season
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let changed = false;

      if (selectedSeriesId && seriesList.length > 0) {
        const found = seriesList.find(s => (s._id || s.id) === selectedSeriesId);
        if (found) {
          const slug = found.slug || String(found.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-');
          if (slug && url.searchParams.get("series") !== slug) {
            url.searchParams.set("series", slug);
            url.searchParams.delete("seriesId");
            changed = true;
          }
        }
      }

      if (selectedSeasonId && seasons.length > 0) {
        const found = seasons.find(s => (s._id || s.id) === selectedSeasonId);
        if (found) {
          const val = String(found.seasonNumber);
          if (url.searchParams.get("season") !== val) {
            url.searchParams.set("season", val);
            url.searchParams.delete("seasonId");
            changed = true;
          }
        }
      }

      if (changed) {
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  }, [selectedSeriesId, selectedSeasonId, seriesList, seasons]);

  // Load existing episodes
  useEffect(() => {
    let cancelled = false;
    async function loadExistingEpisodes() {
      if (!selectedSeriesId || !selectedSeasonId) {
        setExistingEpisodes([]);
        return;
      }
      try {
        const res = await apiFetch(
          `/api/admin/series/${selectedSeriesId}/seasons/${selectedSeasonId}/episodes?limit=500`,
        );
        if (!cancelled) {
          setExistingEpisodes(res.episodes || []);
          if (res.episodes?.length > 0) {
            setExpandedEpisodeId(res.episodes[0]._id || res.episodes[0].id);
          }
        }
      } catch (err) {
        if (!cancelled) notify(err.message, "error");
      }
    }
    loadExistingEpisodes();
    return () => {
      cancelled = true;
    };
  }, [selectedSeriesId, selectedSeasonId]);

  // Sync title
  useEffect(() => {
    if (selectedSeriesId && seriesList.length > 0) {
      const found = seriesList.find(
        (s) => (s._id || s.id) === selectedSeriesId,
      );
      if (found && found.title !== selectedSeriesTitle) {
        setSelectedSeriesTitle(found.title);
      }
    }
  }, [
    selectedSeriesId,
    seriesList,
    selectedSeriesTitle,
    setSelectedSeriesTitle,
  ]);

  const addEmptyRow = () => {
    const highestNumber = episodeRows.reduce(
      (max, row) => Math.max(max, Number(row.episodeNumber || 0)),
      existingEpisodes.reduce(
        (max, ep) => Math.max(max, Number(ep.episodeNumber || 0)),
        0,
      ),
    );
    const newId = crypto.randomUUID();
    setEpisodeRows((prev) => [
      ...prev,
      {
        id: newId,
        episodeNumber: highestNumber + 1,
        title: "",
        description: "",
        thumbnailUrl: "",
        isFree: false,
        isDownloadable: false,
        languages: [],
      },
    ]);
    setExpandedEpisodeId(newId);
  };

  const updateRow = (rowId, patch) => {
    setEpisodeRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    );
  };

  const updateRowLangField = (rowId, langName, key, val) => {
    setEpisodeRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== rowId) return row;
        const langs = [...(row.languages || [])];
        let langIdx = langs.findIndex((l) => l.language === langName);
        if (langIdx === -1) {
          langs.push({
            language: langName,
            title: key === "title" ? val : (row.title || `Episode ${row.episodeNumber} (${langName})`),
            description: key === "description" ? val : (row.description || ""),
            thumbnailUrl: key === "thumbnailUrl" ? val : (row.thumbnailUrl || ""),
            subtitleFile: "",
            videoFiles: [],
          });
        } else {
          langs[langIdx] = { ...langs[langIdx], [key]: val };
        }
        return { ...row, languages: langs };
      })
    );
  };

  const [translatingRows, setTranslatingRows] = useState({}); // { [rowId_langName_fieldKey]: boolean }
  const translatingRowsRef = useRef(new Set());

  const handleTranslateRowLangField = async (rowId, langName, fieldKey, sourceText) => {
    const textToTranslate = String(sourceText || "").trim();
    if (!textToTranslate) {
      notify("Please enter text before auto-translating.", "error");
      return;
    }
    const stateKey = `${rowId}_${langName}_${fieldKey}`;
    if (translatingRowsRef.current.has(stateKey)) return;

    translatingRowsRef.current.add(stateKey);
    setTranslatingRows((prev) => ({ ...prev, [stateKey]: true }));
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToTranslate, targetLang: langName })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.translatedText) {
        updateRowLangField(rowId, langName, fieldKey, data.translatedText);
        notify(`${fieldKey === "title" ? "Title" : "Description"} translated to ${langName}!`);
      } else {
        const errMsg = data.message || `Could not translate ${fieldKey}. Original text kept.`;
        notify(errMsg, "error");
      }
    } catch (err) {
      notify("Network error during translation. Original text kept.", "error");
    } finally {
      translatingRowsRef.current.delete(stateKey);
      setTranslatingRows((prev) => ({ ...prev, [stateKey]: false }));
    }
  };

  const toggleQuality = (q) => {
    setActiveQualities((prev) =>
      prev.includes(q)
        ? prev.length > 1
          ? prev.filter((x) => x !== q)
          : prev
        : [...prev, q].sort((a, b) => presets.indexOf(a) - presets.indexOf(b)),
    );
  };

  const startUploadCell = (file, folder, onProgress) => {
    if (folder === "subtitles" || file.size < 5 * 1024 * 1024) {
      let currentXhr = null;
      let cancelled = false;
      let startTime = Date.now();
      const controller = {
        pause() {},
        resume() {},
        cancel() {
          cancelled = true;
          currentXhr?.abort();
        },
      };
      controller.promise = (async () => {
        const res = await fetch("/api/admin/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            folder,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        if (cancelled) throw new Error("Upload cancelled");

        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          currentXhr = xhr;
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
              const elapsed = (Date.now() - startTime) / 1000;
              const speedBps = elapsed > 0 ? e.loaded / elapsed : 0;
              const remaining = e.total - e.loaded;
              const etaSec = speedBps > 0 ? remaining / speedBps : 0;
              onProgress(
                Math.round((e.loaded / e.total) * 100),
                speedBps,
                etaSec,
              );
            }
          };
          xhr.onload = () => {
            if (xhr.status === 200) resolve({ url: data.url, key: data.key });
            else reject(new Error("S3 upload failed"));
          };
          xhr.onerror = () => reject(new Error("S3 upload failed"));
          xhr.onabort = () => reject(new Error("Upload cancelled"));
          xhr.open("PUT", data.uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      })();
      return controller;
    } else {
      return createMultipartUpload(file, folder, onProgress);
    }
  };

  const handleCellUpload = async (file, rowId, lang, type, quality) => {
    if (!file) return;
    const cellKey = `${rowId}_${lang}_${type === "subtitle" ? "subtitle" : quality}`;

    if (uploadControllersRef.current[cellKey]) {
      uploadControllersRef.current[cellKey].cancel();
      delete uploadControllersRef.current[cellKey];
    }

    setCellUploads((prev) => ({
      ...prev,
      [cellKey]: {
        progress: 0,
        speed: 0,
        eta: 0,
        status: "uploading",
        fileName: file.name,
        fileSize: file.size,
        rowId,
        lang,
        quality,
        type,
        file,
      },
    }));

    try {
      const folder = type === "subtitle" ? "subtitles" : "episodes";
      const ctrl = startUploadCell(file, folder, (pct, bps, etaSec) => {
        setCellUploads((prev) => {
          if (!prev[cellKey]) return prev;
          return {
            ...prev,
            [cellKey]: {
              ...prev[cellKey],
              progress: pct,
              speed: bps,
              fontFamily: "sans-serif",
              eta: etaSec,
            },
          };
        });
      });

      uploadControllersRef.current[cellKey] = ctrl;

      const result = await ctrl.promise;

      setEpisodeRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id !== rowId) return row;
          const langs = [...(row.languages || [])];
          let langIdx = langs.findIndex((l) => l.language === lang);

          if (langIdx === -1) {
            langs.push({
              language: lang,
              title: row.title || `Episode ${row.episodeNumber} (${lang})`,
              description: row.description || "",
              thumbnailUrl: row.thumbnailUrl || "",
              subtitleFile: "",
              videoFiles: [],
            });
            langIdx = langs.length - 1;
          }

          const targetLang = { ...langs[langIdx] };

          if (type === "subtitle") {
            targetLang.subtitleFile = result.url;
          } else {
            const files = [...(targetLang.videoFiles || [])];
            const fIdx = files.findIndex((f) => f.quality === quality);
            const fileObj = {
              quality,
              videoUrl: result.url,
              videoKey: result.key,
              fileSize: file.size,
              duration: 0,
              mimeType: file.type,
            };
            if (fIdx > -1) files[fIdx] = fileObj;
            else files.push(fileObj);
            targetLang.videoFiles = files;
          }

          langs[langIdx] = targetLang;
          return { ...row, languages: langs };
        }),
      );

      setCellUploads((prev) => {
        if (!prev[cellKey]) return prev;
        return {
          ...prev,
          [cellKey]: {
            ...prev[cellKey],
            status: "completed",
            progress: 100,
            speed: 0,
            eta: 0,
          },
        };
      });

      if (type === "video") {
        readVideoDuration(file)
          .then((dur) => {
            if (!dur) return;
            setEpisodeRows((prevRows) =>
              prevRows.map((row) => {
                if (row.id !== rowId) return row;
                const langs = [...(row.languages || [])];
                const langIdx = langs.findIndex((l) => l.language === lang);
                if (langIdx > -1) {
                  const targetLang = { ...langs[langIdx] };
                  const files = [...(targetLang.videoFiles || [])];
                  const fIdx = files.findIndex((f) => f.quality === quality);
                  if (fIdx > -1) files[fIdx].duration = dur;
                  targetLang.videoFiles = files;
                  langs[langIdx] = targetLang;
                }
                return { ...row, languages: langs };
              }),
            );
          })
          .catch(console.error);
      }
    } catch (err) {
      if (err.message === "Upload cancelled") {
        setCellUploads((prev) => {
          const next = { ...prev };
          delete next[cellKey];
          return next;
        });
      } else {
        setCellUploads((prev) => {
          if (!prev[cellKey]) return prev;
          return {
            ...prev,
            [cellKey]: {
              ...prev[cellKey],
              status: "failed",
              error: err.message,
            },
          };
        });
        notify(`Upload failed: ${err.message}`, "error");
      }
    } finally {
      delete uploadControllersRef.current[cellKey];
    }
  };

  const handleCellFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && uploadTarget) {
      handleCellUpload(
        file,
        uploadTarget.rowId,
        uploadTarget.lang,
        uploadTarget.type,
        uploadTarget.quality,
      );
    }
    setUploadTarget(null);
  };

  const handleBulkFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    handleBulkFiles(files);
  };

  const importExistingEpisodes = () => {
    if (!existingEpisodes.length) return;
    const rows = existingEpisodes.map((ep) => ({
      id: ep._id || ep.id,
      episodeNumber: ep.episodeNumber,
      title: ep.title,
      description: ep.description || "",
      thumbnailUrl: ep.thumbnailUrl || "",
      isFree: ep.isFree === true || ep.isFree === "true",
      isDownloadable:
        ep.isDownloadable === true || ep.isDownloadable === "true",
      languages: ep.languages || [],
    }));
    setEpisodeRows(
      rows.sort((a, b) => Number(a.episodeNumber) - Number(b.episodeNumber)),
    );
    if (rows.length > 0) setExpandedEpisodeId(rows[0].id);
    notify(`Imported ${rows.length} existing episode(s)`);
  };

  const parseFilename = (fileName) => {
    const name = fileName.toLowerCase();
    let epNum = null;
    const epMatches =
      name.match(/(?:ep|episode|e)[_.\s-]*(\d+)/i) || name.match(/(\d+)/);
    if (epMatches) epNum = parseInt(epMatches[1]);

    let detectedLang = null;
    for (const lang of selectedLanguages) {
      if (name.includes(lang.toLowerCase())) {
        detectedLang = lang;
        break;
      }
    }
    if (!detectedLang && selectedLanguages.length === 1) {
      detectedLang = selectedLanguages[0];
    }

    let type = "video";
    let quality = null;

    if (
      name.endsWith(".srt") ||
      name.endsWith(".vtt") ||
      name.includes("subtitle") ||
      name.includes("sub")
    ) {
      type = "subtitle";
    } else {
      for (const q of presets) {
        if (name.includes(q)) {
          quality = q;
          break;
        }
      }
      if (!quality && activeQualities.length === 1) {
        quality = activeQualities[0];
      }
    }

    return { epNum, language: detectedLang, type, quality };
  };

  const handleBulkFiles = (files) => {
    if (!selectedSeriesId || !selectedSeasonId) {
      return notify("Select a series and season first.", "error");
    }

    if (uploadTarget && uploadTarget.type === "video_bulk") {
      const { rowId, lang } = uploadTarget;
      let assigned = 0;
      for (const file of files) {
        const parsed = parseFilename(file.name);
        const type = file.name.endsWith(".srt") || file.name.endsWith(".vtt") ? "subtitle" : "video";
        const quality = type === "subtitle" ? null : (parsed.quality || activeQualities[0] || "1080p");
        handleCellUpload(file, rowId, lang, type, quality);
        assigned++;
      }
      if (assigned > 0) {
        notify(`Uploading ${assigned} file(s) for ${lang}.`);
      }
      setUploadTarget(null);
      return;
    }

    if (selectedLanguages.length === 0) {
      return notify("Select at least one language variant.", "error");
    }

    let assigned = 0;
    setEpisodeRows((currentRows) => {
      let nextRows = [...currentRows];
      for (const file of files) {
        const parsed = parseFilename(file.name);

        // Permissive fallbacks — accept ANY file regardless of naming
        const epNum =
          parsed.epNum ||
          (nextRows.length > 0
            ? Number(nextRows[nextRows.length - 1].episodeNumber)
            : nextRows.reduce(
                (max, r) => Math.max(max, Number(r.episodeNumber || 0)),
                0,
              ) + 1);
        const lang = parsed.language || selectedLanguages[0];
        const type =
          parsed.type ||
          (file.name.endsWith(".srt") || file.name.endsWith(".vtt")
            ? "subtitle"
            : "video");
        const quality =
          type === "subtitle"
            ? null
            : parsed.quality || activeQualities[0] || "1080p";

        let row = nextRows.find((r) => Number(r.episodeNumber) === epNum);
        if (!row) {
          row = {
            id: crypto.randomUUID(),
            episodeNumber: epNum,
            title: "",
            description: "",
            thumbnailUrl: "",
            isFree: false,
            isDownloadable: false,
            languages: [],
          };
          nextRows.push(row);
        }
        handleCellUpload(file, row.id, lang, type, quality);
        assigned++;
      }
      return nextRows.sort(
        (a, b) => Number(a.episodeNumber) - Number(b.episodeNumber),
      );
    });

    if (assigned > 0) {
      notify(
        `Uploading ${assigned} file(s). Review episode/language/quality assignments in Episode Coverage tab.`,
      );
      setActiveTab("queue");
    }
  };

  const getRowProgress = (row) => {
    const totalExpected =
      selectedLanguages.length * (activeQualities.length + 1);
    if (!totalExpected) return 0;
    let uploaded = 0;
    for (const lang of selectedLanguages) {
      const lData = (row.languages || []).find((l) => l.language === lang);
      if (lData) {
        if (lData.subtitleFile) uploaded++;
        for (const q of activeQualities) {
          if (
            (lData.videoFiles || []).some((f) => f.quality === q && f.videoUrl)
          ) {
            uploaded++;
          }
        }
      }
    }
    return Math.round((uploaded / totalExpected) * 100);
  };

  const getRowStatus = (progress) => {
    if (progress === 100) return "Completed";
    if (progress > 0) return "Partial";
    return "Pending";
  };

  const handleBulkAction = (action) => {
    if (action === "clear-uploaded") {
      if (confirm("Clear all configured media uploads in this grid?")) {
        setEpisodeRows((prev) => prev.map((r) => ({ ...r, languages: [] })));
        setCellUploads({});
      }
    } else if (action === "toggle-free") {
      setEpisodeRows((prev) => prev.map((r) => ({ ...r, isFree: !r.isFree })));
    } else if (action === "toggle-download") {
      setEpisodeRows((prev) =>
        prev.map((r) => ({ ...r, isDownloadable: !r.isDownloadable })),
      );
    } else if (action === "fill-numbers") {
      setEpisodeRows((prev) =>
        prev.map((r, i) => ({
          ...r,
          episodeNumber: i + 1,
          title: `Episode ${i + 1}`,
        })),
      );
    }
  };

  const downloadTemplate = () => {
    const guideText = `Bulk Episode Upload File Naming Guide
========================================

Name your video and subtitle files according to the following conventions so they are auto-mapped:

1. Video Quality Files:
   Format: ep[Number]_[Language]_[Quality].[ext]
   Examples:
   - ep1_english_1080p.mp4
   - ep1_telugu_4k.mkv
   - ep2_hindi_720p.mp4

2. Subtitle Files:
   Format: ep[Number]_[Language]_subtitle.[ext]
   Examples:
   - ep1_english_subtitle.srt
   - ep2_telugu_subtitle.vtt

Supported Qualities: 4k, 1080p, 720p, 480p, 360p
`;
    const blob = new Blob([guideText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Bulk_Upload_Naming_Template.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const pauseAll = () => {
    Object.keys(uploadControllersRef.current).forEach((key) => {
      const upload = cellUploads[key];
      if (upload && upload.status === "uploading") {
        uploadControllersRef.current[key]?.pause();
        setCellUploads((prev) => ({
          ...prev,
          [key]: { ...prev[key], status: "paused" },
        }));
      }
    });
  };

  const resumeAll = () => {
    Object.keys(uploadControllersRef.current).forEach((key) => {
      const upload = cellUploads[key];
      if (upload && upload.status === "paused") {
        uploadControllersRef.current[key]?.resume();
        setCellUploads((prev) => ({
          ...prev,
          [key]: { ...prev[key], status: "uploading" },
        }));
      }
    });
  };

  const cancelAll = () => {
    Object.keys(uploadControllersRef.current).forEach((key) => {
      uploadControllersRef.current[key]?.cancel();
      delete uploadControllersRef.current[key];
    });
    setCellUploads({});
  };

  const pauseFile = (key) => {
    uploadControllersRef.current[key]?.pause();
    setCellUploads((prev) => ({
      ...prev,
      [key]: { ...prev[key], status: "paused" },
    }));
  };

  const resumeFile = (key) => {
    uploadControllersRef.current[key]?.resume();
    setCellUploads((prev) => ({
      ...prev,
      [key]: { ...prev[key], status: "uploading" },
    }));
  };

  const cancelFile = (key) => {
    uploadControllersRef.current[key]?.cancel();
    delete uploadControllersRef.current[key];
    setCellUploads((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const startAllQueued = () => {
    notify("Active uploads are already processing automatically in the queue.");
  };

  async function handleSubmitQueue(e) {
    e.preventDefault();
    if (!selectedSeriesId || !selectedSeasonId) {
      return notify("Please select a series and season.", "error");
    }
    if (!episodeRows.length) {
      return notify("Queue is empty. Add at least one episode row.", "error");
    }

    setSubmitting(true);
    try {
      let processed = 0;
      for (const row of episodeRows) {
        updateRow(row.id, { status: "uploading" });
        const existing = existingEpisodes.find(
          (ep) =>
            (ep._id || ep.id) === row.id ||
            Number(ep.episodeNumber) === Number(row.episodeNumber),
        );

        const method = existing ? "PUT" : "POST";
        const url = existing
          ? `/api/admin/series/${selectedSeriesId}/seasons/${selectedSeasonId}/episodes/${existing._id || existing.id}`
          : `/api/admin/series/${selectedSeriesId}/seasons/${selectedSeasonId}/episodes`;

        const fd = new FormData();
        fd.append("episodeNumber", String(row.episodeNumber));
        fd.append("title", row.title);
        fd.append("description", row.description);
        fd.append("isFree", String(row.isFree));
        fd.append("isDownloadable", String(row.isDownloadable));
        fd.append("languages", JSON.stringify(row.languages || []));

        if (row.thumbnailUrl) fd.append("thumbnailUrl", row.thumbnailUrl);

        const res = await fetch(url, { method, body: fd });
        const payload = await readJsonResponse(res);
        if (!res.ok || !payload.success) {
          updateRow(row.id, {
            status: "failed",
            error: payload.message || "Failed",
          });
          throw new Error(payload.message || "Save failed");
        }
        processed++;
        updateRow(row.id, { status: "uploaded" });
      }

      notify(`Successfully processed ${processed} episode(s)`);
      setEpisodeRows([]);
      setCellUploads({});
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  // Stats derivations
  const cellUploadsValues = Object.values(cellUploads);
  const statTotal = cellUploadsValues.length;
  const statDone = cellUploadsValues.filter(
    (u) => u.status === "completed",
  ).length;
  const statUploading = cellUploadsValues.filter(
    (u) => u.status === "uploading",
  ).length;
  const statPaused = cellUploadsValues.filter(
    (u) => u.status === "paused",
  ).length;

  const overallProgress =
    statTotal > 0
      ? Math.round(
          cellUploadsValues.reduce((sum, u) => sum + (u.progress || 0), 0) /
            statTotal,
        )
      : 0;

  const totalUploadingSpeed = cellUploadsValues
    .filter((u) => u.status === "uploading")
    .reduce((sum, u) => sum + (u.speed || 0), 0);

  const activeUploadingList = cellUploadsValues.filter(
    (u) => u.status === "uploading",
  );
  let remainingBytes = 0;
  activeUploadingList.forEach((u) => {
    if (u.fileSize && u.progress) {
      remainingBytes += u.fileSize * (1 - u.progress / 100);
    }
  });
  const overallEtaSec =
    totalUploadingSpeed > 0 ? remainingBytes / totalUploadingSpeed : 0;
  const overallSpeedStr = formatSpeed(totalUploadingSpeed);

  // Slot calculations
  const totalSlots =
    episodeRows.length *
    selectedLanguages.length *
    (activeQualities.length + 1);
  let assignedSlots = 0;
  episodeRows.forEach((row) => {
    selectedLanguages.forEach((lang) => {
      const lData = (row.languages || []).find((l) => l.language === lang);
      if (lData) {
        if (lData.subtitleFile) assignedSlots++;
        activeQualities.forEach((q) => {
          if (
            (lData.videoFiles || []).some((f) => f.quality === q && f.videoUrl)
          ) {
            assignedSlots++;
          }
        });
      }
    });
  });
  const coveragePercent =
    totalSlots > 0 ? Math.round((assignedSlots / totalSlots) * 100) : 0;

  const getLanguagePreviewUrl = (row, lang) => {
    const langData = (row.languages || []).find((l) => l.language === lang);
    if (!langData) return null;
    const bestVideo = activeQualities
      .map((q) => (langData.videoFiles || []).find((v) => v.quality === q))
      .filter(Boolean)[0];
    return bestVideo?.videoUrl || null;
  };

  const renderPresetStatus = (row, lang, quality) => {
    const cellKey = `${row.id}_${lang}_${quality}`;
    const upload = cellUploads[cellKey];
    const langData = (row.languages || []).find((l) => l.language === lang);
    const isDone =
      langData &&
      (langData.videoFiles || []).some(
        (f) => f.quality === quality && f.videoUrl,
      );

    if (upload && upload.status === "uploading") {
      return (
        <button
          key={quality}
          type="button"
          onClick={() => {
            if (confirm("Cancel this active upload?")) {
              cancelFile(cellKey);
            }
          }}
          className="qs-btn uploading shrink-0 flex items-center gap-1.5"
        >
          <span className="tag text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded uppercase font-bold">
            {quality}
          </span>
          <span className="spinner" style={{ width: "8px", height: "8px" }} />
        </button>
      );
    }

    if (isDone) {
      return (
        <button
          key={quality}
          type="button"
          onClick={() => {
            if (confirm("Replace this uploaded video file?")) {
              setUploadTarget({ rowId: row.id, lang, type: "video", quality });
              fileInputRef.current?.click();
            }
          }}
          className="qs-btn done shrink-0 flex items-center gap-1.5"
        >
          <span className="tag text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded uppercase font-bold">
            {quality}
          </span>
          <span className="text-[10px] font-bold">✓</span>
        </button>
      );
    }

    return (
      <button
        key={quality}
        type="button"
        onClick={() => {
          setUploadTarget({ rowId: row.id, lang, type: "video", quality });
          fileInputRef.current?.click();
        }}
        className="qs-btn shrink-0 flex items-center gap-1.5"
      >
        <span className="tag text-[9px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded uppercase font-bold">
          {quality}
        </span>
        <span className="text-white/40">+</span>
      </button>
    );
  };

  const renderSubtitleStatus = (row, lang) => {
    const cellKey = `${row.id}_${lang}_subtitle`;
    const upload = cellUploads[cellKey];
    const langData = (row.languages || []).find((l) => l.language === lang);
    const isDone = langData && langData.subtitleFile;

    if (upload && upload.status === "uploading") {
      return (
        <button
          type="button"
          onClick={() => {
            if (confirm("Cancel this active subtitle upload?")) {
              cancelFile(cellKey);
            }
          }}
          className="qs-btn uploading shrink-0 flex items-center gap-1.5"
        >
          <span className="tag text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded uppercase font-bold">
            SUB
          </span>
          <span className="spinner" style={{ width: "8px", height: "8px" }} />
        </button>
      );
    }

    if (isDone) {
      return (
        <button
          type="button"
          onClick={() => {
            if (confirm("Replace this subtitle file?")) {
              setUploadTarget({ rowId: row.id, lang, type: "subtitle" });
              fileInputRef.current?.click();
            }
          }}
          className="qs-btn done shrink-0 flex items-center gap-1.5"
        >
          <span className="tag text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded uppercase font-bold">
            SUB
          </span>
          <span className="text-[10px] font-bold">✓</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          setUploadTarget({ rowId: row.id, lang, type: "subtitle" });
          fileInputRef.current?.click();
        }}
        className="qs-btn shrink-0 flex items-center gap-1.5"
      >
        <span className="tag text-[9px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded uppercase font-bold">
          SUB
        </span>
        <span className="text-white/40">+</span>
      </button>
    );
  };

  const filteredUploads = Object.entries(cellUploads).filter(([_, u]) => {
    if (queueFilter === "all") return true;
    if (queueFilter === "uploading") return u.status === "uploading";
    if (queueFilter === "done") return u.status === "completed";
    if (queueFilter === "paused") return u.status === "paused";
    return true;
  });

  const toggleEpCard = (id) => {
    setExpandedEpisodeId(expandedEpisodeId === id ? null : id);
  };

  return (
    <PageShell>
      {/* Hidden file uploader inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCellFileInputChange}
        className="hidden"
      />
      <input
        type="file"
        ref={bulkFileInputRef}
        onChange={handleBulkFileInputChange}
        multiple
        className="hidden"
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bulk-dashboard {
          --bd-bg: var(--admin-background, #0f0f0f);
          --bd-surface: var(--admin-surface, #1a1a1a);
          --bd-surface2: color-mix(in srgb, var(--admin-surface, #1a1a1a) 70%, white 5%);
          --bd-surface3: color-mix(in srgb, var(--admin-surface, #1a1a1a) 50%, white 8%);
          --bd-border: var(--admin-border, rgba(255,255,255,0.1));
          --bd-border-hover: color-mix(in srgb, var(--admin-border, rgba(255,255,255,0.1)) 40%, var(--admin-accent, #ff1f8f) 60%);
          --bd-pink: var(--admin-accent, #ff1f8f);
          --bd-pink-soft: color-mix(in srgb, var(--admin-accent, #ff1f8f) 15%, transparent);
          --bd-pink-glow: color-mix(in srgb, var(--admin-accent, #ff1f8f) 30%, transparent);
          --bd-green: #00D97E;
          --bd-green-soft: rgba(0,217,126,0.15);
          --bd-amber: #FFB020;
          --bd-amber-soft: rgba(255,176,32,0.15);
          --bd-white: var(--admin-foreground, #ffffff);
          --bd-white70: color-mix(in srgb, var(--admin-foreground, #ffffff) 70%, transparent);
          --bd-white40: color-mix(in srgb, var(--admin-foreground, #ffffff) 40%, transparent);
          --bd-white20: color-mix(in srgb, var(--admin-foreground, #ffffff) 20%, transparent);
          --bd-white10: color-mix(in srgb, var(--admin-foreground, #ffffff) 10%, transparent);
          --bd-muted: var(--admin-muted, rgba(255,255,255,0.4));
          --radius: 12px;
          --radius-sm: 8px;
          --radius-xs: 6px;
        }
        .bulk-dashboard {
          background: var(--bd-bg);
          color: var(--bd-white);
          font-size: 13px;
          border-radius: var(--radius);
          border: 1px solid var(--bd-border);
          overflow: hidden;
        }
        .bulk-dashboard .b-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          min-height: calc(100vh - 150px);
        }
        .bulk-dashboard .sidebar {
          background: var(--bd-surface);
          border-right: 1px solid var(--bd-border);
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
        }
        .bulk-dashboard .sidebar-section-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--bd-muted);
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .bulk-dashboard .form-group { margin-bottom: 14px; }
        .bulk-dashboard .form-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--bd-muted);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 6px;
        }
        .bulk-dashboard .form-select, .bulk-dashboard .form-input {
          width: 100%;
          background: var(--bd-surface2);
          border: 1px solid var(--bd-border);
          color: var(--bd-white);
          padding: 9px 12px;
          border-radius: var(--radius-xs);
          font-size: 13px;
          outline: none;
          transition: border-color 0.18s;
        }
        .bulk-dashboard .form-select:focus, .bulk-dashboard .form-input:focus { border-color: var(--bd-pink); }
        .bulk-dashboard .quality-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .bulk-dashboard .q-toggle {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: all 0.15s;
          user-select: none;
        }
        .bulk-dashboard .q-toggle.active-pink {
          background: var(--bd-pink);
          border-color: var(--bd-pink);
          color: white;
          box-shadow: 0 0 10px var(--bd-pink-glow);
        }
        .bulk-dashboard .q-toggle.active-blue {
          background: var(--bd-pink);
          border-color: var(--bd-pink);
          color: white;
          box-shadow: 0 0 10px var(--bd-pink-glow);
        }
        .bulk-dashboard .q-toggle.inactive {
          background: transparent;
          border-color: var(--bd-border-hover);
          color: var(--bd-muted);
        }
        .bulk-dashboard .q-toggle.inactive:hover { border-color: var(--bd-pink); color: var(--bd-pink); }
        .bulk-dashboard .lang-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .bulk-dashboard .lang-chip {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid var(--bd-border);
          color: var(--bd-muted);
          transition: all 0.15s;
          user-select: none;
        }
        .bulk-dashboard .lang-chip.selected {
          background: var(--bd-pink-soft);
          border-color: var(--bd-pink);
          color: var(--bd-pink);
        }
        .bulk-dashboard .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }
        .bulk-dashboard .stat-card {
          background: var(--bd-surface2);
          border: 1px solid var(--bd-border);
          border-radius: var(--radius-sm);
          padding: 12px;
          text-align: center;
        }
        .bulk-dashboard .stat-card .val {
          font-size: 20px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 3px;
        }
        .bulk-dashboard .stat-card .lbl { font-size: 9px; color: var(--bd-muted); font-weight: 500; text-transform: uppercase; }
        .bulk-dashboard .stat-total .val { color: var(--bd-white); }
        .bulk-dashboard .stat-done .val { color: var(--bd-green); }
        .bulk-dashboard .stat-uploading .val { color: var(--bd-pink); }
        .bulk-dashboard .stat-paused .val { color: var(--bd-amber); }

        .bulk-dashboard .progress-bar-wrap {
          background: var(--bd-surface2);
          border: 1px solid var(--bd-border);
          border-radius: var(--radius-sm);
          padding: 14px;
          margin-bottom: 16px;
        }
        .bulk-dashboard .progress-bar-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .bulk-dashboard .progress-bar-top .pct { font-size: 15px; font-weight: 800; }
        .bulk-dashboard .progress-bar-top .spd { font-size: 11px; color: var(--bd-pink); font-weight: 600; }
        .bulk-dashboard .progress-bar-bg {
          background: var(--bd-surface3);
          border-radius: 10px;
          height: 8px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .bulk-dashboard .progress-bar-fill {
          height: 100%;
          border-radius: 10px;
          background: var(--bd-pink);
          box-shadow: 0 0 8px var(--bd-pink-glow);
          transition: width 0.4s ease;
        }
        .bulk-dashboard .progress-bar-meta { display: flex; justify-content: space-between; font-size: 10px; color: var(--bd-muted); }

        .bulk-dashboard .main { overflow-y: auto; background: var(--bd-bg); display: flex; flex-direction: column; }
        .bulk-dashboard .main-header {
          padding: 20px 24px 0;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .bulk-dashboard .series-thumb {
          width: 56px; height: 56px;
          border-radius: var(--radius-sm);
          background: var(--bd-pink);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .bulk-dashboard .series-info h1 { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: var(--bd-white); }
        .bulk-dashboard .series-info .meta { color: var(--bd-muted); font-size: 12px; margin-top: 3px; }
        .bulk-dashboard .series-info .meta span { color: var(--bd-white70); }

        .bulk-dashboard .tabs {
          display: flex;
          border-bottom: 1px solid var(--bd-border);
          padding: 0 24px;
          margin-bottom: 0;
        }
        .bulk-dashboard .tab {
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--bd-muted);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.18s;
        }
        .bulk-dashboard .tab:hover { color: var(--bd-white70); }
        .bulk-dashboard .tab.active { color: var(--bd-pink); border-bottom-color: var(--bd-pink); }
        .bulk-dashboard .tab-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px; height: 18px;
          background: var(--bd-pink-soft);
          color: var(--bd-pink);
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          margin-left: 5px;
        }

        .bulk-dashboard .tab-panel { display: none; padding: 20px 24px; }
        .bulk-dashboard .tab-panel.active { display: block; }

        .bulk-dashboard .episode-card {
          background: var(--bd-surface);
          border: 1px solid var(--bd-border);
          border-radius: var(--radius);
          margin-bottom: 12px;
          overflow: hidden;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .bulk-dashboard .episode-card:hover { border-color: var(--bd-border-hover); box-shadow: 0 2px 12px var(--bd-pink-soft); }
        .bulk-dashboard .episode-card.has-files { border-left: 3px solid var(--bd-pink); }
        .bulk-dashboard .episode-card.complete { border-left: 3px solid var(--bd-green); }

        .bulk-dashboard .ep-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          cursor: pointer;
          user-select: none;
        }
        .bulk-dashboard .ep-num {
          width: 28px; height: 28px;
          background: var(--bd-surface3);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
          color: var(--bd-white);
        }
        .bulk-dashboard .ep-title { font-size: 14px; font-weight: 700; color: var(--bd-white); }
        .bulk-dashboard .ep-subtitle { font-size: 11px; color: var(--bd-muted); margin-top: 1px; }
        .bulk-dashboard .ep-status {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
        }
        .bulk-dashboard .status-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
        }
        .bulk-dashboard .ep-chevron { color: var(--bd-muted); font-size: 10px; transition: transform 0.2s; margin-left: 8px; }
        .bulk-dashboard .ep-card-body { display: none; padding: 0 16px 16px; }
        .bulk-dashboard .ep-card-body.open { display: block; }

        .bulk-dashboard .lang-matrix { display: flex; flex-direction: column; gap: 10px; }
        .bulk-dashboard .lang-row {
          display: grid;
          grid-template-columns: 100px 1fr auto;
          align-items: center;
          gap: 12px;
          background: var(--bd-surface2);
          border-radius: var(--radius-xs);
          padding: 10px 14px;
          border: 1px solid var(--bd-border);
        }
        .bulk-dashboard .lang-name {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--bd-white70);
        }
        .bulk-dashboard .quality-selectors { display: flex; gap: 6px; flex-wrap: wrap; }
        .bulk-dashboard .qs-btn {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          border: 1.5px solid var(--bd-border);
          color: var(--bd-muted);
          background: transparent;
          transition: all 0.15s;
        }
        .bulk-dashboard .qs-btn:hover { border-color: var(--bd-pink); color: var(--bd-pink); }
        .bulk-dashboard .qs-btn.assigned {
          background: var(--bd-pink-soft);
          border-color: var(--bd-pink);
          color: var(--bd-pink);
        }
        .bulk-dashboard .qs-btn.uploading {
          background: var(--bd-amber-soft);
          border-color: var(--bd-amber);
          color: var(--bd-amber);
          animation: qs-pulse 1.2s ease-in-out infinite;
        }
        @keyframes qs-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .bulk-dashboard .qs-btn.done {
          background: var(--bd-green-soft);
          border-color: var(--bd-green);
          color: var(--bd-green);
        }
        .bulk-dashboard .lang-row-action { display: flex; gap: 6px; }
        .bulk-dashboard .mini-btn {
          padding: 5px 10px;
          border-radius: var(--radius-xs);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--bd-border);
          color: var(--bd-muted);
          background: transparent;
          transition: all 0.15s;
        }
        .bulk-dashboard .mini-btn:hover { border-color: var(--bd-pink); color: var(--bd-pink); }

        .bulk-dashboard .drop-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }
        .bulk-dashboard .drop-zone {
          border: 2px dashed var(--bd-border);
          border-radius: var(--radius-sm);
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .bulk-dashboard .drop-zone:hover, .bulk-dashboard .drop-zone.drag-over {
          border-color: var(--bd-pink);
          background: var(--bd-pink-soft);
        }
        .bulk-dashboard .drop-zone .dz-icon { font-size: 28px; margin-bottom: 8px; }
        .bulk-dashboard .drop-zone .dz-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--bd-white); }
        .bulk-dashboard .drop-zone .dz-sub { font-size: 11px; color: var(--bd-muted); }
        .bulk-dashboard .drop-zone .dz-formats {
          display: flex;
          gap: 4px;
          justify-content: center;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .bulk-dashboard .fmt-tag {
          padding: 2px 8px;
          background: var(--bd-surface3);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: var(--bd-muted);
        }

        .bulk-dashboard .queue-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .bulk-dashboard .queue-toolbar .left { display: flex; gap: 8px; }
        .bulk-dashboard .queue-toolbar .right { margin-left: auto; display: flex; gap: 8px; }

        .bulk-dashboard .filter-chip {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid var(--bd-border);
          color: var(--bd-muted);
          background: transparent;
          transition: all 0.15s;
          user-select: none;
        }
        .bulk-dashboard .filter-chip.active { background: var(--bd-pink-soft); border-color: var(--bd-pink); color: var(--bd-pink); }
        .bulk-dashboard .filter-chip:hover:not(.active) { border-color: var(--bd-pink); color: var(--bd-pink); }

        .bulk-dashboard .upload-table { width: 100%; border-collapse: collapse; }
        .bulk-dashboard .upload-table th {
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          color: var(--bd-muted);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 8px 12px;
          border-bottom: 1px solid var(--bd-border);
        }
        .bulk-dashboard .upload-table td {
          padding: 12px 12px;
          border-bottom: 1px solid var(--bd-border);
          vertical-align: middle;
        }
        .bulk-dashboard .upload-table tr:last-child td { border-bottom: none; }
        .bulk-dashboard .upload-table tr:hover td { background: var(--bd-surface2); }

        .bulk-dashboard .file-info { display: flex; align-items: center; gap: 10px; }
        .bulk-dashboard .file-icon {
          width: 34px; height: 34px;
          border-radius: var(--radius-xs);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .bulk-dashboard .file-icon.video { background: var(--bd-pink-soft); }
        .bulk-dashboard .file-icon.subtitle { background: var(--bd-pink-soft); }
        .bulk-dashboard .file-name { font-size: 13px; font-weight: 600; color: var(--bd-white); }
        .bulk-dashboard .file-meta { font-size: 11px; color: var(--bd-muted); margin-top: 1px; }

        .bulk-dashboard .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }
        .bulk-dashboard .badge-done { background: var(--bd-green-soft); color: var(--bd-green); }
        .bulk-dashboard .badge-uploading { background: var(--bd-pink-soft); color: var(--bd-pink); }
        .bulk-dashboard .badge-paused { background: var(--bd-amber-soft); color: var(--bd-amber); }
        .bulk-dashboard .badge-queued { background: var(--bd-white10); color: var(--bd-muted); }
        .bulk-dashboard .badge-error { background: rgba(255,45,45,0.15); color: #FF4545; }

        .bulk-dashboard .prog-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .bulk-dashboard .prog-pct { font-size: 12px; font-weight: 700; min-width: 36px; color: var(--bd-white); }
        .bulk-dashboard .prog-mini-bg {
          flex: 1;
          height: 6px;
          background: var(--bd-surface3);
          border-radius: 10px;
          overflow: hidden;
        }
        .bulk-dashboard .prog-mini-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.4s;
        }
        .bulk-dashboard .fill-blue { background: var(--bd-pink); }
        .bulk-dashboard .fill-green { background: var(--bd-green); }
        .bulk-dashboard .fill-amber { background: var(--bd-amber); }
        .bulk-dashboard .fill-pink { background: var(--bd-pink); }
        .bulk-dashboard .prog-sub { font-size: 10px; color: var(--bd-muted); }

        .bulk-dashboard .speed-cell { font-size: 12px; font-weight: 600; color: var(--bd-pink); white-space: nowrap; }
        .bulk-dashboard .eta-cell { font-size: 12px; color: var(--bd-muted); white-space: nowrap; }

        .bulk-dashboard .row-actions { display: flex; gap: 6px; }
        .bulk-dashboard .icon-btn {
          width: 28px; height: 28px;
          border-radius: var(--radius-xs);
          background: transparent;
          border: 1px solid var(--bd-border);
          color: var(--bd-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.15s;
        }
        .bulk-dashboard .icon-btn:hover { border-color: var(--bd-pink); color: var(--bd-pink); }

        .bulk-dashboard .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .bulk-dashboard .section-title { font-size: 14px; font-weight: 700; color: var(--bd-white); }
        .bulk-dashboard .section-sub { font-size: 11px; color: var(--bd-muted); margin-top: 2px; }

        .bulk-dashboard .divider { height: 1px; background: var(--bd-border); margin: 16px 0; }

        .bulk-dashboard .ep-slot-summary {
          font-size: 11px;
          color: var(--bd-muted);
          margin-left: auto;
          font-weight: 500;
        }
        .bulk-dashboard .ep-slot-summary span { color: var(--bd-pink); font-weight: 700; }

        .bulk-dashboard .coverage-bar-bg {
          height: 4px;
          background: var(--bd-surface3);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        .bulk-dashboard .coverage-bar-fill {
          height: 100%;
          border-radius: 10px;
          background: var(--bd-pink);
          box-shadow: 0 0 8px var(--bd-pink-glow);
          transition: width 0.4s;
        }

        .bulk-dashboard .spinner {
          width: 12px; height: 12px;
          border: 2px solid var(--bd-pink-soft);
          border-top-color: var(--bd-pink);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .bulk-dashboard .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: var(--radius-xs);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.18s;
          letter-spacing: 0.2px;
        }
        .bulk-dashboard .btn-ghost {
          background: transparent;
          color: var(--bd-white70);
          border: 1px solid var(--bd-border);
        }
        .bulk-dashboard .btn-ghost:hover { background: var(--bd-white10); color: var(--bd-white); border-color: var(--bd-border-hover); }
        .bulk-dashboard .btn-pink {
          background: var(--bd-pink);
          color: white;
          box-shadow: 0 0 20px var(--bd-pink-glow);
        }
        .bulk-dashboard .btn-pink:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 24px var(--bd-pink-glow); }
        .bulk-dashboard .btn-blue {
          background: var(--bd-pink);
          color: white;
          box-shadow: 0 0 20px var(--bd-pink-glow);
        }
        .bulk-dashboard .btn-blue:hover { filter: brightness(1.1); transform: translateY(-1px); }
      `,
        }}
      />

      <form onSubmit={handleSubmitQueue} className="bulk-dashboard">
        {/* Custom Subbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--bd-border)",
            padding: "12px 24px",
            background: "var(--bd-surface)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--bd-muted)",
            }}
          >
            <span>Content Hub</span>
            <span style={{ color: "var(--bd-muted)" }}>›</span>
            <span>Series</span>
            <span style={{ color: "var(--bd-muted)" }}>›</span>
            <span style={{ color: "var(--bd-white70)", fontWeight: 600 }}>
              {selectedSeriesTitle || "Series"}
            </span>
            <span style={{ color: "var(--bd-muted)" }}>›</span>
            <span style={{ color: "var(--bd-pink)", fontWeight: 700 }}>
              Bulk Upload
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={downloadTemplate}
            >
              ⬇ Guide
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={addEmptyRow}
            >
              ＋ Add Episode
            </button>
            {existingEpisodes.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{
                  color: "var(--bd-pink)",
                  borderColor: "var(--bd-pink-soft)",
                }}
                onClick={importExistingEpisodes}
              >
                Import Existing ({existingEpisodes.length})
              </button>
            )}
            <button
              type="button"
              className="btn btn-blue"
              onClick={startAllQueued}
            >
              ▶ Start All
            </button>
            <button
              type="submit"
              className="btn btn-pink"
              disabled={submitting || !episodeRows.length}
            >
              {submitting ? "Processing..." : "Save Session"}
            </button>
          </div>
        </div>

        <div className="b-layout">
          {/* Sidebar */}
          <div className="sidebar">
            {/* Session Overview */}
            <div>
              <div className="sidebar-section-label">Session Overview</div>
              <div className="stats-row">
                <div className="stat-card stat-total">
                  <div className="val">{statTotal}</div>
                  <div className="lbl">Total Files</div>
                </div>
                <div className="stat-card stat-done">
                  <div className="val">{statDone}</div>
                  <div className="lbl">Completed</div>
                </div>
                <div className="stat-card stat-uploading">
                  <div className="val">{statUploading}</div>
                  <div className="lbl">Uploading</div>
                </div>
                <div className="stat-card stat-paused">
                  <div className="val">{statPaused}</div>
                  <div className="lbl">Paused</div>
                </div>
              </div>

              {/* Overall progress */}
              <div className="progress-bar-wrap">
                <div className="progress-bar-top">
                  <span className="pct">{overallProgress}%</span>
                  <span className="spd">{overallSpeedStr}</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
                <div className="progress-bar-meta">
                  <span>
                    {statDone} of {statTotal} files
                  </span>
                  <span>
                    {overallEtaSec > 0
                      ? `~${formatEta(overallEtaSec)} left`
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Session Config */}
            <div>
              <div className="sidebar-section-label">Session Config</div>

              <div className="form-group">
                <label className="form-label">Series</label>
                <select
                  className="form-select bg-[#181C35] border border-[rgba(255,255,255,0.08)] text-white text-xs p-2.5 rounded-lg w-full"
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Series --</option>
                  {seriesList.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Season</label>
                <select
                  className="form-select bg-[#181C35] border border-[rgba(255,255,255,0.08)] text-white text-xs p-2.5 rounded-lg w-full"
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                  required
                  disabled={!selectedSeriesId}
                >
                  <option value="">-- Choose Season --</option>
                  {seasons.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      Season {s.seasonNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Languages</label>
                <div className="lang-chips">
                  {languagesList.map((l) => {
                    const langName = l.englishName;
                    const isSelected = selectedLanguages.includes(langName);
                    return (
                      <div
                        key={langName}
                        className={cn("lang-chip", isSelected && "selected")}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedLanguages(
                              selectedLanguages.filter((x) => x !== langName),
                            );
                          } else {
                            setSelectedLanguages([
                              ...selectedLanguages,
                              langName,
                            ]);
                          }
                        }}
                      >
                        {langName}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quality Presets</label>
                <div className="quality-grid">
                  {presets.map((q) => {
                    const active = activeQualities.includes(q);
                    return (
                      <div
                        key={q}
                        className={cn(
                          "q-toggle uppercase",
                          active ? "active-pink" : "inactive",
                        )}
                        onClick={() => toggleQuality(q)}
                      >
                        {q}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* File Naming Guide */}
            <div>
              <div className="sidebar-section-label">File Naming Guide</div>
              <div className="bg-[#181C35] rounded-lg p-3 text-[11px] text-white/40 leading-relaxed border border-[rgba(255,255,255,0.08)]">
                <div className="text-white/70 font-semibold mb-1">
                  Video files
                </div>
                <code className="text-blue-400 font-mono text-[10px]">
                  ep1_english_1080p.mp4
                </code>
                <div className="mb-2.5">ep[number]_[lang]_[quality].[ext]</div>
                <div className="text-white/70 font-semibold mb-1">
                  Subtitles
                </div>
                <code className="text-pink-400 font-mono text-[10px]">
                  ep1_english_subtitle.srt
                </code>
                <div>ep[number]_[lang]_subtitle.[ext]</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main flex-1">
            {/* Series Header */}
            <div className="main-header">
              <div className="series-thumb">🎬</div>
              <div className="series-info">
                <h1>{selectedSeriesTitle || "Select a Series"}</h1>
                <div className="meta">
                  <span>
                    {activeSeason
                      ? `Season ${activeSeason.seasonNumber}`
                      : "Select a Season"}
                  </span>{" "}
                  · <span>{episodeRows.length} Episode(s)</span> ·{" "}
                  <span>{selectedLanguages.join(" · ")}</span> ·{" "}
                  <span className="uppercase">
                    {activeQualities.join(" · ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <div
                className={cn("tab", activeTab === "episodes" && "active")}
                onClick={() => setActiveTab("episodes")}
              >
                Episode Coverage{" "}
                <span className="tab-count">{episodeRows.length}</span>
              </div>
              <div
                className={cn("tab", activeTab === "queue" && "active")}
                onClick={() => setActiveTab("queue")}
              >
                Upload Queue <span className="tab-count">{statTotal}</span>
              </div>
              <div
                className={cn("tab", activeTab === "preview" && "active")}
                onClick={() => setActiveTab("preview")}
              >
                Video Preview
              </div>
              <div
                className={cn("tab", activeTab === "csv" && "active")}
                onClick={() => setActiveTab("csv")}
              >
                CSV Import
              </div>
            </div>

            {/* Tab Panel: Episode Coverage */}
            <div
              className={cn("tab-panel", activeTab === "episodes" && "active")}
            >
              <div className="section-header">
                <div>
                  <div className="section-title">Episode Coverage Matrix</div>
                  <div className="section-sub">
                    Assign video files per episode → language → quality. Click
                    any quality pill to manage.
                  </div>
                </div>
                <div className="ep-slot-summary">
                  Coverage: <span>{assignedSlots}</span> / {totalSlots} slots
                </div>
              </div>

              <div className="coverage-bar-bg">
                <div
                  className="coverage-bar-fill"
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>

              {/* Drop zones */}
              <div className="drop-row mb-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const files = Array.from(e.dataTransfer.files || []);
                    handleBulkFiles(files);
                  }}
                  onClick={() => bulkFileInputRef.current?.click()}
                  className={cn("drop-zone", isDragging && "drag-over")}
                >
                  <div className="dz-icon">🎬</div>
                  <div className="dz-title">Drop video files here</div>
                  <div className="dz-sub">Auto-matched by filename pattern</div>
                  <div className="dz-formats">
                    <span className="fmt-tag">MP4</span>
                    <span className="fmt-tag">MKV</span>
                    <span className="fmt-tag">MOV</span>
                  </div>
                </div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const files = Array.from(e.dataTransfer.files || []);
                    handleBulkFiles(files);
                  }}
                  onClick={() => bulkFileInputRef.current?.click()}
                  className={cn("drop-zone", isDragging && "drag-over")}
                >
                  <div className="dz-icon">💬</div>
                  <div className="dz-title">Drop subtitle files here</div>
                  <div className="dz-sub">
                    One file per episode per language
                  </div>
                  <div className="dz-formats">
                    <span className="fmt-tag">SRT</span>
                    <span className="fmt-tag">VTT</span>
                  </div>
                </div>
              </div>

              {/* Accordion list */}
              {episodeRows.length > 0 ? (
                episodeRows.map((row) => {
                  const rowProg = getRowProgress(row);
                  const rowStatus = getRowStatus(rowProg);
                  const isOpen = expandedEpisodeId === row.id;

                  return (
                    <div
                      key={row.id}
                      className={cn(
                        "episode-card",
                        rowProg === 100
                          ? "complete"
                          : rowProg > 0
                            ? "has-files"
                            : "",
                      )}
                    >
                      <div
                        className="ep-header"
                        onClick={() => toggleEpCard(row.id)}
                      >
                        <div
                          className="ep-num"
                          style={
                            rowProg === 100
                              ? {
                                  background: "rgba(0,217,126,0.15)",
                                  color: "#00D97E",
                                }
                              : rowProg > 0
                                ? {
                                    background: "rgba(45,140,255,0.15)",
                                    color: "#2D8CFF",
                                  }
                                : {}
                          }
                        >
                          {row.episodeNumber}
                        </div>
                        <div>
                          <div className="ep-title">
                            {row.title || `Episode ${row.episodeNumber}`}
                          </div>
                          <div className="ep-subtitle">
                            {row.description
                              ? row.description.substring(0, 75) + "..."
                              : "No description set"}
                          </div>
                        </div>
                        <div className="ep-status flex items-center gap-1.5">
                          <div
                            className="status-dot"
                            style={
                              rowStatus === "Completed"
                                ? { background: "#00D97E" }
                                : rowStatus === "Partial"
                                  ? { background: "#FFB020" }
                                  : { background: "rgba(255,255,255,0.4)" }
                            }
                          />
                          <span
                            style={
                              rowStatus === "Completed"
                                ? { color: "#00D97E" }
                                : rowStatus === "Partial"
                                  ? { color: "#FFB020" }
                                  : { color: "rgba(255,255,255,0.4)" }
                            }
                          >
                            {rowStatus}
                          </span>
                        </div>
                        <div className="ep-chevron ml-2">
                          {isOpen ? "▼" : "▶"}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="ep-card-body open px-4 pb-4 border-t border-[var(--bd-border)] bg-black/10 text-left">
                          {/* Title / Description / Thumbnail metadata input */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 mt-2">
                            <div className="md:col-span-1">
                              <label className="form-label text-[10px] text-white/50 uppercase font-bold tracking-wider mb-1 block">Episode Number</label>
                              <input
                                type="number"
                                className="form-input bg-[#181C35] border border-[rgba(255,255,255,0.08)] text-white text-xs p-2 rounded w-full"
                                value={row.episodeNumber}
                                onChange={(e) => updateRow(row.id, { episodeNumber: Number(e.target.value) })}
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="form-label text-[10px] text-white/50 uppercase font-bold tracking-wider mb-1 block">Episode Title</label>
                              <input
                                type="text"
                                className="form-input bg-[#181C35] border border-[rgba(255,255,255,0.08)] text-white text-xs p-2 rounded w-full"
                                value={row.title}
                                onChange={(e) => updateRow(row.id, { title: e.target.value })}
                                placeholder="Enter title"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="md:col-span-3">
                              <label className="form-label text-[10px] text-white/50 uppercase font-bold tracking-wider mb-1 block">Description</label>
                              <textarea
                                rows={2}
                                className="form-input bg-[#181C35] border border-[rgba(255,255,255,0.08)] text-white text-xs p-2 rounded w-full min-h-[60px]"
                                value={row.description}
                                onChange={(e) => updateRow(row.id, { description: e.target.value })}
                                placeholder="Enter description"
                              />
                            </div>
                            <div className="md:col-span-1">
                              <label className="form-label text-[10px] text-white/50 uppercase font-bold tracking-wider mb-1 block">Thumbnail URL</label>
                              <div className="relative flex items-center">
                                <input
                                  type="text"
                                  className="form-input bg-[#181C35] border border-[rgba(255,255,255,0.08)] text-white text-xs p-2 pr-7 rounded w-full"
                                  value={row.thumbnailUrl || ""}
                                  onChange={(e) => updateRow(row.id, { thumbnailUrl: e.target.value })}
                                  placeholder="https://..."
                                />
                                {row.thumbnailUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => updateRow(row.id, { thumbnailUrl: "" })}
                                    className="absolute right-2 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Clear thumbnail URL"
                                  >
                                    <X size={13} />
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {/* Language Navigation Tabs */}
                          <div className="flex border-b border-[var(--bd-border)] mb-4">
                            {selectedLanguages.map((lang) => {
                              const activeLang = rowActiveLangs[row.id] || selectedLanguages[0];
                              const isSelected = activeLang === lang;
                              
                              // Count of uploaded assets for this language
                              const langData = (row.languages || []).find((l) => l.language === lang);
                              const subCount = langData?.subtitleFile ? 1 : 0;
                              const vidCount = (langData?.videoFiles || []).filter(f => f.videoUrl).length;
                              const assetCount = subCount + vidCount;

                              return (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => setRowActiveLangs(prev => ({ ...prev, [row.id]: lang }))}
                                  className={cn(
                                    "px-4 py-2 text-xs font-semibold border-b-2 transition-all mr-2 flex items-center gap-1.5",
                                    isSelected 
                                      ? "text-[var(--bd-pink)] border-[var(--bd-pink)] bg-[var(--bd-pink-soft)]" 
                                      : "text-white/40 border-transparent hover:text-white/70"
                                  )}
                                >
                                  {lang}
                                  {assetCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-[var(--bd-pink-soft)] text-[var(--bd-pink)] font-bold">
                                      {assetCount}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Upload Panel for Active Language */}
                          {(() => {
                            const activeLang = rowActiveLangs[row.id] || selectedLanguages[0];
                            if (!activeLang) return null;

                            const langData = (row.languages || []).find((l) => l.language === activeLang);
                            const previewUrl = getLanguagePreviewUrl(row, activeLang);

                            return (
                              <div 
                                onDragOver={(e) => { e.preventDefault(); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setUploadTarget({ rowId: row.id, lang: activeLang, type: "video_bulk" });
                                  const files = Array.from(e.dataTransfer.files || []);
                                  handleBulkFiles(files);
                                }}
                                className="bg-black/20 p-3 rounded-lg border border-[var(--bd-border)]"
                              >
                                {/* Localized Title & Description inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block">
                                        Title ({activeLang})
                                      </label>
                                      {(() => {
                                        const sourceTitle = String(langData?.title || row.title || "").trim();
                                        const isTitleEmpty = !sourceTitle;
                                        const isTitleTranslating = Boolean(translatingRows[`${row.id}_${activeLang}_title`]);
                                        return (
                                          <button
                                            type="button"
                                            disabled={isTitleEmpty || isTitleTranslating}
                                            onClick={() => handleTranslateRowLangField(row.id, activeLang, "title", sourceTitle)}
                                            className={cn(
                                              "text-[10px] font-semibold transition-colors inline-flex items-center gap-1",
                                              isTitleEmpty || isTitleTranslating
                                                ? "text-white/30 cursor-not-allowed opacity-50"
                                                : "text-pink-500 hover:text-pink-600 cursor-pointer"
                                            )}
                                            title={
                                              isTitleEmpty
                                                ? "Enter text in Title to enable auto-translate"
                                                : isTitleTranslating
                                                  ? "Translating title..."
                                                  : `Auto-translate Title to ${activeLang}`
                                            }
                                          >
                                            {isTitleTranslating ? (
                                              <>
                                                <Loader2 size={10} className="animate-spin" />
                                                <span>Translating...</span>
                                              </>
                                            ) : (
                                              "✨ Auto-Translate"
                                            )}
                                          </button>
                                        );
                                      })()}
                                    </div>
                                    <input
                                      type="text"
                                      className="form-input bg-[#181C35] border border-[rgba(255,255,255,0.08)] text-white text-xs p-2 rounded w-full"
                                      value={langData?.title || ""}
                                      onChange={(e) => updateRowLangField(row.id, activeLang, "title", e.target.value)}
                                      placeholder={`Enter localized title in ${activeLang}`}
                                    />
                                  </div>

                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block">
                                        Description ({activeLang})
                                      </label>
                                      {(() => {
                                        const sourceDesc = String(langData?.description || row.description || "").trim();
                                        const isDescEmpty = !sourceDesc;
                                        const isDescTranslating = Boolean(translatingRows[`${row.id}_${activeLang}_description`]);
                                        return (
                                          <button
                                            type="button"
                                            disabled={isDescEmpty || isDescTranslating}
                                            onClick={() => handleTranslateRowLangField(row.id, activeLang, "description", sourceDesc)}
                                            className={cn(
                                              "text-[10px] font-semibold transition-colors inline-flex items-center gap-1",
                                              isDescEmpty || isDescTranslating
                                                ? "text-white/30 cursor-not-allowed opacity-50"
                                                : "text-pink-500 hover:text-pink-600 cursor-pointer"
                                            )}
                                            title={
                                              isDescEmpty
                                                ? "Enter text in Description to enable auto-translate"
                                                : isDescTranslating
                                                  ? "Translating description..."
                                                  : `Auto-translate Description to ${activeLang}`
                                            }
                                          >
                                            {isDescTranslating ? (
                                              <>
                                                <Loader2 size={10} className="animate-spin" />
                                                <span>Translating...</span>
                                              </>
                                            ) : (
                                              "✨ Auto-Translate"
                                            )}
                                          </button>
                                        );
                                      })()}
                                    </div>
                                    <input
                                      type="text"
                                      className="form-input bg-[#181C35] border border-[rgba(255,255,255,0.08)] text-white text-xs p-2 rounded w-full"
                                      value={langData?.description || ""}
                                      onChange={(e) => updateRowLangField(row.id, activeLang, "description", e.target.value)}
                                      placeholder={`Enter localized description in ${activeLang}`}
                                    />
                                  </div>
                                </div>

                                {/* Upload Dropzone / selectors */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                  <div
                                    onClick={() => {
                                      setUploadTarget({ rowId: row.id, lang: activeLang, type: "video_bulk" });
                                      bulkFileInputRef.current?.click();
                                    }}
                                    className="p-3 border border-dashed border-white/20 hover:border-[var(--bd-pink)] hover:bg-[var(--bd-pink-soft)] rounded-lg text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[70px]"
                                  >
                                    <svg className="w-5 h-5 text-[var(--bd-pink)] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="text-white font-semibold text-[11px] uppercase tracking-wide">Select/Drop Videos</span>
                                    <span className="text-white/40 text-[9px] mt-0.5">Telugu, English, etc. (Multi-qualities)</span>
                                  </div>

                                  <div
                                    onClick={() => {
                                      setUploadTarget({ rowId: row.id, lang: activeLang, type: "subtitle" });
                                      fileInputRef.current?.click();
                                    }}
                                    className="p-3 border border-dashed border-white/20 hover:border-sky-500 hover:bg-sky-500/10 rounded-lg text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[70px]"
                                  >
                                    <svg className="w-5 h-5 text-sky-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-white font-semibold text-[11px] uppercase tracking-wide">Select Subtitle</span>
                                    <span className="text-white/40 text-[9px] mt-0.5">SRT/VTT file for {activeLang}</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-2">Video Qualities & Subtitles</div>

                                  {/* Qualities Status Grid */}
                                  {activeQualities.map((q) => {
                                    const cellKey = `${row.id}_${activeLang}_${q}`;
                                    const upload = cellUploads[cellKey];
                                    const isDone = langData && (langData.videoFiles || []).some((f) => f.quality === q && f.videoUrl);
                                    const videoFile = isDone ? (langData.videoFiles || []).find((f) => f.quality === q) : null;

                                    return (
                                      <div key={q} className="flex flex-col md:flex-row md:items-center justify-between p-2.5 bg-black/30 rounded border border-white/5 gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded uppercase text-white tracking-wide shrink-0">
                                            {q}
                                          </span>
                                          {isDone ? (
                                            <span className="text-xs text-white/80 font-medium truncate max-w-[250px]" title={videoFile.videoUrl}>
                                              Uploaded ({(videoFile.fileSize ? (videoFile.fileSize / (1024 * 1024)).toFixed(1) : "?")} MB)
                                            </span>
                                          ) : upload ? (
                                            <span className="text-xs text-amber-500 font-semibold truncate max-w-[250px]">
                                              {upload.status === "uploading" ? "Uploading..." : upload.status === "paused" ? "Paused" : "Failed"}
                                            </span>
                                          ) : (
                                            <span className="text-xs text-white/30 font-medium">No video file uploaded</span>
                                          )}
                                        </div>

                                        {/* Upload tracking or Action buttons */}
                                        {upload ? (
                                          <div className="flex-1 max-w-md flex items-center gap-3">
                                            <div className="flex-1">
                                              <div className="flex justify-between text-[9px] text-white/50 mb-0.5">
                                                <span>{upload.progress}% ({(upload.fileSize ? ((upload.fileSize * upload.progress / 100) / (1024 * 1024)).toFixed(1) : "0")}MB / {((upload.fileSize || 0) / (1024 * 1024)).toFixed(1)}MB)</span>
                                                <span>{upload.speed ? formatSpeed(upload.speed) : ""}</span>
                                              </div>
                                              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-[var(--bd-pink)] h-1.5 rounded-full" style={{ width: `${upload.progress}%` }}></div>
                                              </div>
                                            </div>
                                            <div className="flex gap-1.5 shrink-0">
                                              {upload.status === "uploading" ? (
                                                <button
                                                  type="button"
                                                  onClick={() => pauseFile(cellKey)}
                                                  className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded hover:bg-amber-500/20"
                                                >
                                                  Pause
                                                </button>
                                              ) : upload.status === "paused" ? (
                                                <button
                                                  type="button"
                                                  onClick={() => resumeFile(cellKey)}
                                                  className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded hover:bg-blue-500/20"
                                                >
                                                  Resume
                                                </button>
                                              ) : null}
                                              <button
                                                type="button"
                                                onClick={() => cancelFile(cellKey)}
                                                className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded hover:bg-red-500/20"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            {isDone ? (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setPreviewVideoData({
                                                      url: videoFile.videoUrl,
                                                      title: row.title || `Episode ${row.episodeNumber}`,
                                                      lang: activeLang,
                                                      quality: q
                                                    });
                                                    setActiveTab("preview");
                                                  }}
                                                  className="px-2 py-1 border border-white/10 text-white/80 rounded text-[10px] font-semibold hover:border-pink-500 hover:text-pink-500 transition"
                                                >
                                                  Preview
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (confirm("Remove this quality file?")) {
                                                      setEpisodeRows((prevRows) =>
                                                        prevRows.map((r) => {
                                                          if (r.id !== row.id) return r;
                                                          const langs = [...(r.languages || [])];
                                                          const langIdx = langs.findIndex((l) => l.language === activeLang);
                                                          if (langIdx > -1) {
                                                            langs[langIdx].videoFiles = (langs[langIdx].videoFiles || []).filter(f => f.quality !== q);
                                                          }
                                                          return { ...r, languages: langs };
                                                        })
                                                      );
                                                    }
                                                  }}
                                                  className="px-2 py-1 border border-red-500/20 text-red-400 rounded text-[10px] font-semibold hover:border-red-500/40 hover:bg-red-500/5 transition"
                                                >
                                                  Remove
                                                </button>
                                              </>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setUploadTarget({ rowId: row.id, lang: activeLang, type: "video", quality: q });
                                                  fileInputRef.current?.click();
                                                }}
                                                className="px-2.5 py-1 bg-white/5 text-white/50 border border-white/10 rounded text-[10px] font-semibold hover:border-pink-500 hover:text-pink-500 hover:bg-pink-500/5 transition"
                                              >
                                                Upload Video
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {/* Subtitle Status Row */}
                                  {(() => {
                                    const cellKey = `${row.id}_${activeLang}_subtitle`;
                                    const upload = cellUploads[cellKey];
                                    const isDone = langData && langData.subtitleFile;

                                    return (
                                      <div className="flex flex-col md:flex-row md:items-center justify-between p-2.5 bg-black/30 rounded border border-white/5 mt-2 gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-500/10 rounded uppercase text-sky-400 tracking-wide shrink-0">
                                            Subtitle
                                          </span>
                                          {isDone ? (
                                            <span className="text-xs text-white/80 font-medium truncate max-w-[250px]" title={langData.subtitleFile}>
                                              Uploaded SRT/VTT
                                            </span>
                                          ) : upload ? (
                                            <span className="text-xs text-amber-500 font-semibold">
                                              Uploading...
                                            </span>
                                          ) : (
                                            <span className="text-xs text-white/30 font-medium">No subtitle file uploaded</span>
                                          )}
                                        </div>

                                        {upload ? (
                                          <div className="flex-1 max-w-md flex items-center gap-3">
                                            <div className="flex-1">
                                              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-[var(--bd-pink)] h-1.5 rounded-full animate-pulse" style={{ width: `${upload.progress}%` }}></div>
                                              </div>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => cancelFile(cellKey)}
                                              className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold rounded hover:bg-red-500/20 shrink-0"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            {isDone ? (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (confirm("Remove this subtitle file?")) {
                                                    setEpisodeRows((prevRows) =>
                                                      prevRows.map((r) => {
                                                        if (r.id !== row.id) return r;
                                                        const langs = [...(r.languages || [])];
                                                        const langIdx = langs.findIndex((l) => l.language === activeLang);
                                                        if (langIdx > -1) {
                                                          langs[langIdx].subtitleFile = "";
                                                        }
                                                        return { ...r, languages: langs };
                                                      })
                                                    );
                                                  }
                                                }}
                                                className="px-2 py-1 border border-red-500/20 text-red-400 rounded text-[10px] font-semibold hover:border-red-500/40 hover:bg-red-500/5 transition"
                                              >
                                                Remove
                                              </button>
                                            ) : (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setUploadTarget({ rowId: row.id, lang: activeLang, type: "subtitle" });
                                                  fileInputRef.current?.click();
                                                }}
                                                className="px-2.5 py-1 bg-white/5 text-white/50 border border-white/10 rounded text-[10px] font-semibold hover:border-pink-500 hover:text-pink-500 hover:bg-pink-500/5 transition"
                                              >
                                                Upload Subtitle
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    background: "var(--bd-surface)",
                    borderRadius: "12px",
                    border: "1px solid var(--bd-border)",
                  }}
                >
                  <p style={{ color: "var(--bd-muted)" }}>
                    No episodes configured. Select Series/Season and import
                    existing episodes or click &quot;＋ Add Episode&quot; above.
                  </p>
                </div>
              )}
            </div>

            {/* Tab Panel: Upload Queue */}
            <div className={cn("tab-panel", activeTab === "queue" && "active")}>
              <div className="queue-toolbar">
                <div className="left flex gap-1.5">
                  <div
                    className={cn(
                      "filter-chip",
                      queueFilter === "all" && "active",
                    )}
                    onClick={() => setQueueFilter("all")}
                  >
                    All ({statTotal})
                  </div>
                  <div
                    className={cn(
                      "filter-chip",
                      queueFilter === "uploading" && "active",
                    )}
                    onClick={() => setQueueFilter("uploading")}
                  >
                    Uploading ({statUploading})
                  </div>
                  <div
                    className={cn(
                      "filter-chip",
                      queueFilter === "done" && "active",
                    )}
                    onClick={() => setQueueFilter("done")}
                  >
                    Done ({statDone})
                  </div>
                  <div
                    className={cn(
                      "filter-chip",
                      queueFilter === "paused" && "active",
                    )}
                    onClick={() => setQueueFilter("paused")}
                  >
                    Paused ({statPaused})
                  </div>
                </div>
                <div className="right flex gap-1.5">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={pauseAll}
                  >
                    ⏸ Pause All
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost text-blue-500 border-blue-500/20"
                    onClick={resumeAll}
                  >
                    ▶ Resume All
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost text-red-500 border-red-500/20"
                    onClick={cancelAll}
                  >
                    ✕ Cancel All
                  </button>
                </div>
              </div>

              {filteredUploads.length > 0 ? (
                <div
                  style={{
                    border: "1px solid var(--bd-border)",
                    background: "var(--bd-surface)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <table className="upload-table">
                    <thead>
                      <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
                        <th>File</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Speed</th>
                        <th>ETA</th>
                        <th>Size</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUploads.map(([cellKey, u]) => {
                        const isDone = u.status === "completed";
                        const isUploading = u.status === "uploading";
                        const isPaused = u.status === "paused";
                        const isFailed = u.status === "failed";

                        return (
                          <tr
                            key={cellKey}
                            className="border-b border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.01)] transition"
                          >
                            <td>
                              <div className="file-info">
                                <div
                                  className={cn(
                                    "file-icon",
                                    u.type === "subtitle"
                                      ? "subtitle"
                                      : "video",
                                  )}
                                >
                                  {u.type === "subtitle" ? "💬" : "🎬"}
                                </div>
                                <div>
                                  <div className="file-name font-semibold">
                                    {u.fileName}
                                  </div>
                                  <div className="file-meta flex items-center gap-1.5 text-xs text-white/40">
                                    <span>Lang: {u.lang}</span>
                                    {u.quality && (
                                      <>
                                        <span>·</span>
                                        <span className="tag text-[9px] px-1 bg-white/5 text-white/70 rounded uppercase font-bold">
                                          {u.quality}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {isDone && (
                                <span className="status-badge badge-done">
                                  ✓ Done
                                </span>
                              )}
                              {isUploading && (
                                <span className="status-badge badge-uploading">
                                  <span
                                    className="spinner mr-1 shrink-0"
                                    style={{ width: "8px", height: "8px" }}
                                  />{" "}
                                  Uploading
                                </span>
                              )}
                              {isPaused && (
                                <span className="status-badge badge-paused">
                                  ⏸ Paused
                                </span>
                              )}
                              {isFailed && (
                                <span className="status-badge badge-error">
                                  ✕ Error
                                </span>
                              )}
                            </td>
                            <td className="progress-cell">
                              <div className="prog-row flex items-center gap-2">
                                <span className="prog-pct text-xs font-bold w-9">
                                  {u.progress}%
                                </span>
                                <div className="prog-mini-bg bg-[#1E2340] h-1.5 rounded-full overflow-hidden flex-1">
                                  <div
                                    className={cn(
                                      "prog-mini-fill h-full rounded-full transition-all duration-300",
                                      isDone
                                        ? "fill-green"
                                        : isPaused
                                          ? "fill-amber"
                                          : "fill-blue",
                                    )}
                                    style={{ width: `${u.progress}%` }}
                                  />
                                </div>
                              </div>
                              {u.fileSize && (
                                <div className="prog-sub text-[10px] text-white/40">
                                  {(
                                    (u.fileSize * (u.progress / 100)) /
                                    1024 /
                                    1024
                                  ).toFixed(1)}{" "}
                                  MB / {(u.fileSize / 1024 / 1024).toFixed(1)}{" "}
                                  MB
                                </div>
                              )}
                            </td>
                            <td className="speed-cell">
                              {isUploading
                                ? formatSpeed(u.speed)
                                : isPaused
                                  ? "Paused"
                                  : "—"}
                            </td>
                            <td className="eta-cell">
                              {isUploading
                                ? formatEta(u.eta)
                                : isDone
                                  ? "Done"
                                  : "—"}
                            </td>
                            <td className="text-white/40 text-xs font-mono">
                              {u.fileSize
                                ? `${(u.fileSize / 1024 / 1024).toFixed(1)} MB`
                                : "—"}
                            </td>
                            <td>
                              <div className="row-actions flex items-center gap-1.5">
                                {isDone ? (
                                  <button
                                    type="button"
                                    className="icon-btn play hover:text-blue-500 hover:border-blue-500/30"
                                    title="Play Video"
                                    onClick={async () => {
                                      const matchedRow = episodeRows.find(
                                        (r) => r.id === u.rowId,
                                      );
                                      setPreviewVideoData({
                                        url:
                                          matchedRow?.languages
                                            ?.find((l) => l.language === u.lang)
                                            ?.videoFiles?.find(
                                              (f) => f.quality === u.quality,
                                            )?.videoUrl || "",
                                        title:
                                          matchedRow?.title ||
                                          `Episode ${matchedRow?.episodeNumber || ""}`,
                                        lang: u.lang,
                                        quality: u.quality,
                                      });
                                      setActiveTab("preview");
                                    }}
                                  >
                                    ▶
                                  </button>
                                ) : isUploading ? (
                                  <button
                                    type="button"
                                    className="icon-btn pause hover:text-amber-500 hover:border-amber-500/30"
                                    title="Pause"
                                    onClick={() => pauseFile(cellKey)}
                                  >
                                    ⏸
                                  </button>
                                ) : isPaused ? (
                                  <button
                                    type="button"
                                    className="icon-btn play hover:text-blue-500 hover:border-blue-500/30"
                                    title="Resume"
                                    onClick={() => resumeFile(cellKey)}
                                  >
                                    ▶
                                  </button>
                                ) : null}
                                {!isDone && (
                                  <button
                                    type="button"
                                    className="icon-btn cancel hover:text-red-500 hover:border-red-500/30"
                                    title="Cancel"
                                    onClick={() => cancelFile(cellKey)}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 20px",
                    background: "var(--bd-surface)",
                    borderRadius: "12px",
                    border: "1px solid var(--bd-border)",
                  }}
                >
                  <p style={{ color: "var(--bd-muted)" }}>
                    No uploads in the queue. Drop files or select cells in
                    Episode Coverage tab.
                  </p>
                </div>
              )}
            </div>

            {/* Tab Panel: Video Preview */}
            <div
              className={cn("tab-panel", activeTab === "preview" && "active")}
            >
              {previewVideoData?.url ? (
                <div
                  style={{
                    maxWidth: "860px",
                    margin: "0 auto",
                    background: "var(--bd-surface)",
                    border: "1px solid var(--bd-border)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    padding: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "var(--bd-white)",
                        }}
                      >
                        {previewVideoData.title}
                      </h3>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--bd-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginTop: "3px",
                        }}
                      >
                        <span>Language: {previewVideoData.lang}</span>
                        <span>·</span>
                        <span
                          style={{
                            fontSize: "9px",
                            padding: "1px 5px",
                            background: "var(--bd-pink-soft)",
                            color: "var(--bd-pink)",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}
                        >
                          {previewVideoData.quality}
                        </span>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mini-btn"
                      style={{
                        borderColor: "rgba(255,60,60,0.2)",
                        color: "#ff4545",
                      }}
                      onClick={() => setPreviewVideoData(null)}
                    >
                      ✕ Clear
                    </button>
                  </div>

                  <div
                    style={{
                      background: "#000",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid var(--bd-border)",
                      aspectRatio: "16/9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <video
                      key={previewVideoData.url}
                      src={previewVideoData.url}
                      controls
                      autoPlay
                      preload="metadata"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "80px 20px",
                    background: "var(--bd-surface)",
                    borderRadius: "16px",
                    border: "1px solid var(--bd-border)",
                    maxWidth: "860px",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "var(--bd-pink-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      color: "var(--bd-pink)",
                    }}
                  >
                    ▶
                  </div>
                  <div>
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "var(--bd-white)",
                      }}
                    >
                      No active preview
                    </h3>
                    <p
                      style={{
                        color: "var(--bd-muted)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Select a completed upload from Episode Coverage or Queue
                      to preview it here.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Panel: CSV Import */}
            <div className={cn("tab-panel", activeTab === "csv" && "active")}>
              <div
                style={{
                  maxWidth: "560px",
                  margin: "0 auto",
                  background: "var(--bd-surface)",
                  border: "1px solid var(--bd-border)",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: "15px",
                      color: "var(--bd-white)",
                    }}
                  >
                    Import Episodes Metadata CSV
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--bd-muted)",
                      marginTop: "4px",
                    }}
                  >
                    Load bulk episode titles and descriptions before matching
                    video files.
                  </p>
                </div>

                <div
                  style={{
                    border: "2px dashed var(--bd-border)",
                    background: "var(--bd-surface2)",
                    borderRadius: "12px",
                    padding: "32px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{ fontSize: "22px" }}>📊</div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "var(--bd-white)",
                    }}
                  >
                    Select a CSV document
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--bd-muted)",
                      maxWidth: "280px",
                      lineHeight: 1.6,
                    }}
                  >
                    CSV columns:{" "}
                    <code
                      style={{
                        color: "var(--bd-pink)",
                        fontFamily: "monospace",
                        fontSize: "10px",
                      }}
                    >
                      episodeNumber, title, description, isFree, isDownloadable
                    </code>
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    style={{
                      cursor: "pointer",
                      fontSize: "12px",
                      border: "1px solid var(--bd-border)",
                      background: "var(--bd-surface)",
                      color: "var(--bd-white)",
                      borderRadius: "6px",
                      padding: "6px 10px",
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const text = event.target.result;
                        const lines = text
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean);
                        if (lines.length <= 1)
                          return notify("CSV has no data rows.", "error");
                        const headers = lines[0]
                          .split(",")
                          .map((h) => h.trim());
                        const rows = [];
                        for (let i = 1; i < lines.length; i++) {
                          const values = lines[i]
                            .split(",")
                            .map((v) => v.trim());
                          if (values.length >= headers.length) {
                            rows.push({
                              id: crypto.randomUUID(),
                              episodeNumber: parseInt(values[0]) || i,
                              title: values[1] || `Episode ${values[0]}`,
                              description: values[2] || "",
                              isFree: values[3] === "true",
                              isDownloadable: values[4] === "true",
                              languages: [],
                            });
                          }
                        }
                        setEpisodeRows(
                          rows.sort(
                            (a, b) => a.episodeNumber - b.episodeNumber,
                          ),
                        );
                        if (rows.length > 0) setExpandedEpisodeId(rows[0].id);
                        notify(
                          `Imported ${rows.length} episode row(s) from CSV.`,
                        );
                        setActiveTab("episodes");
                      };
                      reader.readAsText(file);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Inline detailed Settings Edit modal popup */}
      {editingRow && (
        <Dialog open={true} onOpenChange={() => setEditingRow(null)}>
          <DialogContent className="max-w-2xl w-[min(720px,calc(100vw-32px))]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                Episode {editingRow.episodeNumber} — Metadata & Media
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Configure episode synopsis, upload a custom video thumbnail, and manage tier entitlements.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="sm:col-span-1 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                    Episode #
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editingRow.episodeNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingRow((prev) => ({
                        ...prev,
                        episodeNumber: val,
                      }));
                      updateRow(editingRow.id, { episodeNumber: val });
                    }}
                    className="h-10 text-sm font-semibold"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                    Episode Title
                  </label>
                  <Input
                    value={editingRow.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingRow((prev) => ({ ...prev, title: val }));
                      updateRow(editingRow.id, { title: val });
                    }}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                  Synopsis / Description
                </label>
                <Textarea
                  value={editingRow.description}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingRow((prev) => ({ ...prev, description: val }));
                    updateRow(editingRow.id, { description: val });
                  }}
                  rows={3}
                  className="text-sm"
                  placeholder="Episode synopsis description..."
                />
              </div>

              {/* Episode Poster Thumbnail upload in details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                  Episode Thumbnail Artwork
                </label>
                <ImageUploadField
                  label="Thumbnail Image"
                  currentUrl={editingRow.thumbnailUrl}
                  onFileChange={async (file) => {
                    if (!file) {
                      updateRow(editingRow.id, { thumbnailUrl: "" });
                      setEditingRow((prev) => ({ ...prev, thumbnailUrl: "" }));
                      return;
                    }
                    try {
                      notify("Uploading thumbnail...", "info");
                      const result = await uploadToS3(
                        file,
                        "episode-thumbnails",
                      );
                      updateRow(editingRow.id, { thumbnailUrl: result.url });
                      setEditingRow((prev) => ({
                        ...prev,
                        thumbnailUrl: result.url,
                      }));
                      notify("Thumbnail uploaded!");
                    } catch (err) {
                      notify(err.message, "error");
                    }
                  }}
                  aspectRatio="16/9"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-2 p-3.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/40">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2.5 text-xs font-bold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRow.isDownloadable}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setEditingRow((prev) => ({
                          ...prev,
                          isDownloadable: val,
                        }));
                        updateRow(editingRow.id, { isDownloadable: val });
                      }}
                      className="rounded border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)] h-4 w-4"
                    />
                    <span>Allow Offline Download</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-bold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRow.isFree}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setEditingRow((prev) => ({ ...prev, isFree: val }));
                        updateRow(editingRow.id, { isFree: val });
                      }}
                      className="rounded border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)] h-4 w-4"
                    />
                    <span>Free Preview Episode</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-[var(--admin-muted)] pt-1 border-t border-[var(--admin-border)]">
                  <span>📥 <strong>Download:</strong> Only active subscribers can download.</span>
                  <span>🎟️ <strong>Free:</strong> Watchable by all; if unchecked, subscription is required.</span>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                onClick={() => setEditingRow(null)}
                className="h-9 px-5 font-bold"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageShell>
  );
}

function TrailersView({
  data,
  loading,
  filters,
  setFilters,
  setPage,
  refresh,
  notify,
  selectedSeriesId,
  setSelectedSeriesId,
  selectedSeriesTitle,
  setSelectedSeriesTitle,
}) {
  // Series/Season selection
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [loadingSeasons, setLoadingSeasons] = useState(false);

  // Current trailer document for the selected season
  const [currentTrailer, setCurrentTrailer] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  // Simple video trailer state
  const [videoUrl, setVideoUrl] = useState("");
  const [videoKey, setVideoKey] = useState("");
  const [duration, setDuration] = useState(0);
  const [fileSize, setFileSize] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const seriesList = data?.series || [];

  // Load seasons when series changes
  async function loadSeasons() {
    if (!selectedSeriesId) {
      setSeasons([]);
      setSelectedSeasonId("");
      return;
    }
    setLoadingSeasons(true);
    try {
      const res = await apiFetch(
        `/api/admin/series/${selectedSeriesId}/seasons`,
      );
      const list = res.seasons || [];
      setSeasons(list);
      if (list.length) setSelectedSeasonId(list[0]._id || list[0].id);
      else setSelectedSeasonId("");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoadingSeasons(false);
    }
  }

  useEffect(() => {
    loadSeasons();
  }, [selectedSeriesId]);

  // Load existing trailer for the selected season
  async function loadTrailer() {
    if (!selectedSeriesId || !selectedSeasonId) {
      setCurrentTrailer(null);
      setVideoUrl("");
      setVideoKey("");
      setDuration(0);
      setFileSize(null);
      setMimeType(null);
      return;
    }
    setLoadingTrailer(true);
    try {
      const res = await apiFetch(
        `/api/admin/trailers?seasonId=${selectedSeasonId}`,
      );
      const found = res.trailers?.[0] || null;
      setCurrentTrailer(found);
      setVideoUrl(found?.videoUrl || "");
      setVideoKey(found?.videoKey || "");
      setDuration(found?.duration || 0);
      setFileSize(found?.fileSize || null);
      setMimeType(found?.mimeType || null);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoadingTrailer(false);
    }
  }

  useEffect(() => {
    loadTrailer();
  }, [selectedSeriesId, selectedSeasonId]);

  const setVideoFile = (uploadData) => {
    if (!uploadData) {
      setVideoUrl("");
      setVideoKey("");
      setDuration(0);
      setFileSize(null);
      setMimeType(null);
    } else {
      setVideoUrl(uploadData.url || "");
      setVideoKey(uploadData.key || "");
      setDuration(uploadData.duration || 0);
      setFileSize(uploadData.size || null);
      setMimeType(uploadData.type || null);
    }
  };

  async function handleSave() {
    if (!selectedSeriesId || !selectedSeasonId)
      return notify("Select a series and season first", "error");
    if (!videoUrl) return notify("Please upload a video file first", "error");
    setSubmitting(true);
    try {
      const payload = {
        seriesId: selectedSeriesId,
        seasonId: selectedSeasonId,
        videoUrl,
        videoKey,
        duration,
        fileSize,
        mimeType,
        isActive: true,
      };
      const url = currentTrailer
        ? `/api/admin/trailers/${currentTrailer._id || currentTrailer.id}`
        : "/api/admin/trailers";
      const method = currentTrailer ? "PUT" : "POST";
      const body = JSON.stringify(payload);
      const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body,
      });
      const res = await readJsonResponse(response);
      if (!response.ok || !res.success)
        throw new Error(res.message || "Save failed");
      notify(currentTrailer ? "Trailer updated" : "Trailer created");
      loadTrailer();
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!currentTrailer) return;
    if (!confirm("Delete this season trailer?")) return;
    try {
      const response = await fetch(
        `/api/admin/trailers/${currentTrailer._id || currentTrailer.id}`,
        { method: "DELETE" },
      );
      const res = await readJsonResponse(response);
      if (!response.ok || !res.success)
        throw new Error(res.message || "Delete failed");
      notify("Trailer deleted");
      setCurrentTrailer(null);
      setVideoUrl("");
      setVideoKey("");
      setDuration(0);
      setFileSize(null);
      setMimeType(null);
      refresh();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <PageShell>
      {/* Series + Season selection */}
      <div className="mb-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block mb-1">
            Series
          </label>
          <Select
            value={selectedSeriesId}
            onChange={(e) => {
              setSelectedSeriesId(e.target.value);
              setSelectedSeasonId("");
            }}
            className="w-64"
          >
            <option value="">-- Choose Series --</option>
            {seriesList.map((s) => (
              <option key={s._id || s.id} value={s._id || s.id}>
                {s.title}
              </option>
            ))}
          </Select>
        </div>
        {selectedSeriesId && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block mb-1">
              Season
            </label>
            <Select
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="w-40"
              disabled={loadingSeasons}
            >
              <option value="">-- Season --</option>
              {seasons.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  Season {s.seasonNumber}
                </option>
              ))}
            </Select>
          </div>
        )}
        {selectedSeriesId && selectedSeasonId && (
          <div className="flex gap-2 ml-auto">
            {currentTrailer && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-500 border-red-300 hover:bg-red-50"
              >
                <Trash2 size={15} className="mr-1" /> Delete Trailer
              </Button>
            )}
            <Button onClick={handleSave} disabled={submitting}>
              {submitting
                ? "Saving..."
                : currentTrailer
                  ? "Update Trailer"
                  : "Save Trailer"}
            </Button>
          </div>
        )}
      </div>

      {!selectedSeriesId || !selectedSeasonId ? (
        <EmptyState
          icon={Video}
          title="Select Series & Season"
          description="Choose a series and season above to manage its trailer."
        />
      ) : loadingTrailer ? (
        <PinkLoader className="min-h-64" />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {currentTrailer ? "Edit Season Trailer" : "New Season Trailer"}
              </CardTitle>
              {currentTrailer && (
                <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                  Saved
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--admin-muted)] mt-1">
              Upload a single video for this trailer. No thumbnail or resolution
              variations required.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4">
              <div className="max-w-xl">
                <VideoUploadField
                  label="Trailer Video File"
                  currentUrl={videoUrl}
                  onFileChange={setVideoFile}
                  onDirectUpload={(f, prog) => uploadToS3(f, "trailers", prog)}
                />
              </div>
            </div>

            {videoUrl && (
              <div className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4">
                <label className="text-xs font-bold uppercase text-[var(--admin-muted)] block mb-2">
                  Trailer Preview & Playback
                </label>
                <div className="relative aspect-video max-w-xl overflow-hidden rounded bg-black">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}

function BannersView({
  data,
  loading,
  filters,
  setFilters,
  setPage,
  refresh,
  notify,
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    linkedContentId: "",
    linkedContentType: "series",
    order: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const banners = data?.banners || [];

  async function loadSeries() {
    setLoadingSeries(true);
    try {
      const res = await apiFetch("/api/admin/series?all=true");
      setSeriesList(res.series || []);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoadingSeries(false);
    }
  }

  useEffect(() => {
    if (open) {
      loadSeries();
    }
  }, [open]);

  useEffect(() => {
    if (form.linkedContentId && seriesList.length > 0) {
      const selected = seriesList.find(
        (s) => (s._id || s.id) === form.linkedContentId,
      );
      if (selected) {
        setForm((prev) => ({
          ...prev,
          title: selected.title || "",
          subtitle: selected.description || "",
          linkedContentType: "series",
        }));
      }
    }
  }, [form.linkedContentId, seriesList]);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || "",
        subtitle: editing.subtitle || "",
        linkedContentId: editing.linkedContentId || "",
        linkedContentType: editing.linkedContentType || "series",
        order: editing.order || "",
        isActive: editing.isActive !== false,
      });
    } else {
      setForm({
        title: "",
        subtitle: "",
        linkedContentId: "",
        linkedContentType: "series",
        order: banners.length + 1,
        isActive: true,
      });
    }
    setImageFile(null);
  }, [editing, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.linkedContentId) return notify("Please select a series", "error");
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        fd.append(key, val);
      });
      if (imageFile) fd.append("image", imageFile);

      const url = editing
        ? `/api/admin/banners/${editing._id || editing.id}`
        : "/api/admin/banners";
      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, { method, body: fd });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Saving failed");

      notify(editing ? "Banner updated" : "Banner created");
      setOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await showConfirm("Are you sure you want to delete this banner?");
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Deletion failed");
      notify("Banner deleted");
      refresh();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  async function handleMove(index, direction) {
    const nextBanners = [...banners];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const [moved] = nextBanners.splice(index, 1);
    nextBanners.splice(targetIndex, 0, moved);

    try {
      const response = await fetch("/api/admin/banners/reorder", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: nextBanners.map((b, i) => ({
            id: b._id || b.id,
            order: i + 1,
          })),
        }),
      });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Reorder failed");
      notify("Banner order saved");
      refresh();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <PageShell>
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={17} /> Add Banner
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[min(760px,calc(100vw-32px))]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                {editing ? "Edit Homepage Hero Banner" : "Add New Hero Banner"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Link a featured title, upload a widescreen banner creative, and set carousel position.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                  Linked Content / Series <span className="text-red-500">*</span>
                </label>
                {loadingSeries ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2
                      className="animate-spin text-[var(--admin-primary)]"
                      size={20}
                    />
                    <span className="text-xs text-[var(--admin-muted)]">
                      Loading series catalogue...
                    </span>
                  </div>
                ) : (
                  <Select
                    value={form.linkedContentId}
                    onChange={(e) =>
                      setForm({ ...form, linkedContentId: e.target.value })
                    }
                    required
                    className="bg-[var(--admin-surface)] text-[var(--admin-foreground)] h-11 text-sm"
                  >
                    <option value="">-- Choose Series / Title --</option>
                    {seriesList.map((series) => (
                      <option
                        key={series._id || series.id}
                        value={series._id || series.id}
                      >
                        {series.title} {series.isFeatured ? "★ (Featured)" : ""}
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                  Display Order Priority
                </label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  placeholder="0"
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-1">
                <ImageUploadField
                  label="Hero Banner Image (16:9)"
                  currentUrl={editing?.imageUrl}
                  file={imageFile}
                  onFileChange={setImageFile}
                  aspectRatio="16/9"
                  disabled={submitting}
                />
                <div className="flex flex-col justify-center">
                  <div className="p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/40">
                    <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) =>
                          setForm({ ...form, isActive: e.target.checked })
                        }
                        className="rounded border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)] h-4 w-4"
                      />
                      <span>Active on Carousel</span>
                    </label>
                    <p className="text-xs text-[var(--admin-muted)] mt-1.5 pl-6">
                      Toggle whether this hero banner is currently displayed to active subscribers and guests.
                    </p>
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !form.linkedContentId}
              >
                {submitting ? "Saving..." : "Save Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <PinkLoader className="min-h-96" />
          ) : banners.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                      <th className="px-3 py-3">Banner image & title</th>
                      <th className="px-3 py-3">Order</th>
                      <th className="px-3 py-3">Reorder</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner, index) => (
                      <tr
                        key={banner._id || banner.id}
                        className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-soft)]"
                      >
                        <td className="px-3 py-4 font-semibold flex items-center gap-3">
                          <div className="grid h-12 w-24 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[var(--admin-soft)]">
                            {banner.imageUrl ? (
                              <img
                                src={banner.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Image
                                className="text-[var(--admin-primary)]"
                                size={20}
                              />
                            )}
                          </div>
                          <div>
                            <p>{banner.title}</p>
                            <p className="text-xs text-[var(--admin-muted)]">
                              {banner.subtitle}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-4 font-bold">
                          {banner.order || 0}
                        </td>
                        <td className="px-3 py-4 flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMove(index, -1)}
                            disabled={index === 0}
                          >
                            ▲
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMove(index, 1)}
                            disabled={index === banners.length - 1}
                          >
                            ▼
                          </Button>
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge
                            status={banner.isActive ? "Active" : "Suspended"}
                          />
                        </td>
                        <td className="px-3 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onSelect={() => {
                                  setEditing(banner);
                                  setOpen(true);
                                }}
                              >
                                <Pencil size={16} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleDelete(banner._id || banner.id)
                                }
                              >
                                <Trash2 size={16} className="text-red-500" />{" "}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={data?.pagination} setPage={setPage} />
            </>
          ) : (
            <EmptyState
              icon={Image}
              title="No banners found"
              description="Create a banner to customize home feed."
            />
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function ComingSoonView({
  data,
  loading,
  filters,
  setFilters,
  setPage,
  refresh,
  notify,
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    expectedReleaseDate: "",
    linkedContentId: "",
    isActive: true,
  });
  const [posterFile, setPosterFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const comingSoonItems = data?.comingSoon || [];

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || "",
        description: editing.description || "",
        expectedReleaseDate: toLocalDatetimeString(editing.expectedReleaseDate),
        linkedContentId: editing.linkedContentId || "",
        isActive: editing.isActive !== false,
      });
    } else {
      setForm({
        title: "",
        description: "",
        expectedReleaseDate: "",
        linkedContentId: "",
        isActive: true,
      });
    }
    setPosterFile(null);
  }, [editing, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) return notify("Title is required", "error");
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === "expectedReleaseDate" && val) {
          try {
            fd.append(key, new Date(val).toISOString());
          } catch (e) {
            fd.append(key, val);
          }
        } else {
          fd.append(key, val);
        }
      });
      if (posterFile) fd.append("posterImage", posterFile);

      const url = editing
        ? `/api/admin/coming-soon/${editing._id || editing.id}`
        : "/api/admin/coming-soon";
      const method = editing ? "PUT" : "POST";

      const response = await fetch(url, { method, body: fd });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Saving failed");

      notify(editing ? "Coming Soon item updated" : "Coming Soon item created");
      setOpen(false);
      setEditing(null);
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = await showConfirm("Are you sure you want to delete this Coming Soon item?");
    if (!confirmed) return;
    try {
      const response = await fetch(`/api/admin/coming-soon/${id}`, {
        method: "DELETE",
      });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Deletion failed");
      notify("Coming Soon item deleted");
      refresh();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  async function handleNotify(id) {
    try {
      const response = await fetch(`/api/admin/coming-soon/${id}/notify`, {
        method: "POST",
      });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Notification broadcast failed");
      notify(
        `Notifications sent successfully to ${payload.notifiedCount || 0} registered user(s)!`,
      );
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <PageShell>
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus size={17} /> Add Coming Soon
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[min(760px,calc(100vw-32px))]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                {editing ? "Edit Coming Soon Title" : "Add Coming Soon Title"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Announce upcoming releases, set launch dates, and enable reminder registrations.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. Baahubali: Before the Beginning"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Expected Release Date & Time <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.expectedReleaseDate}
                    onChange={(e) =>
                      setForm({ ...form, expectedReleaseDate: e.target.value })
                    }
                    required
                    min={toLocalDatetimeString(new Date())}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                  Synopsis / Pitch Description
                </label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Short teaser or synopsis description..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-1">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      Linked Content ID (Optional)
                    </label>
                    <Input
                      value={form.linkedContentId}
                      onChange={(e) =>
                        setForm({ ...form, linkedContentId: e.target.value })
                      }
                      placeholder="Linked Content MongoDB ID"
                    />
                  </div>
                  <div className="p-3.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/40">
                    <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) =>
                          setForm({ ...form, isActive: e.target.checked })
                        }
                        className="rounded border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)] h-4 w-4"
                      />
                      <span>Active / Published</span>
                    </label>
                  </div>
                </div>

                <ImageUploadField
                  label="Poster Image (2:3)"
                  currentUrl={editing?.posterUrl}
                  file={posterFile}
                  onFileChange={setPosterFile}
                  aspectRatio="2/3"
                  disabled={submitting}
                />
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Title"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon Titles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <PinkLoader className="min-h-96" />
          ) : comingSoonItems.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                      <th className="px-3 py-3">Coming Soon Title</th>
                      <th className="px-3 py-3">Expected Release</th>
                      <th className="px-3 py-3">Subscribers</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comingSoonItems.map((item) => (
                      <tr
                        key={item._id || item.id}
                        className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-soft)]"
                      >
                        <td className="px-3 py-4 font-semibold flex items-center gap-3">
                          <div className="grid h-12 w-9 shrink-0 place-items-center overflow-hidden rounded-[4px] bg-[var(--admin-soft)]">
                            {item.posterUrl ? (
                              <img
                                src={item.posterUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Calendar
                                className="text-[var(--admin-primary)]"
                                size={18}
                              />
                            )}
                          </div>
                          <div>
                            <p>{item.title}</p>
                            <p className="text-xs text-[var(--admin-muted)] max-w-sm truncate">
                              {item.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          {item.expectedReleaseDate
                            ? formatDate(item.expectedReleaseDate)
                            : "-"}
                        </td>
                        <td className="px-3 py-4 font-bold text-cyan-500">
                          {item.notifyUsers?.length || 0}
                        </td>
                        <td className="px-3 py-4">
                          <StatusBadge
                            status={item.isActive ? "Active" : "Suspended"}
                          />
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNotify(item._id || item.id)}
                              disabled={!item.notifyUsers?.length}
                            >
                              Notify Users
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal size={18} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setEditing(item);
                                    setOpen(true);
                                  }}
                                >
                                  <Pencil size={16} /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    handleDelete(item._id || item.id)
                                  }
                                >
                                  <Trash2 size={16} className="text-red-500" />{" "}
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={data?.pagination} setPage={setPage} />
            </>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No items found"
              description="Add a coming soon title to build hype."
            />
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function TrendingView({
  data,
  loading,
  filters,
  setFilters,
  setPage,
  refresh,
  notify,
}) {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [contents, setContents] = useState([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [form, setForm] = useState({ contentId: "", rank: "1" });
  const [submitting, setSubmitting] = useState(false);

  const trendingItems = data?.trending || [];

  async function loadContents() {
    setLoadingContents(true);
    try {
      const res = await apiFetch("/api/admin/videos?limit=100");
      setContents(res.videos || []);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoadingContents(false);
    }
  }

  useEffect(() => {
    if (open) {
      loadContents();
    }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.contentId) return notify("Please select content", "error");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/trending/${form.contentId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rank: Number(form.rank) }),
      });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Action failed");

      notify(
        editingItem ? "Rank updated successfully" : "Content added to trending",
      );
      setOpen(false);
      setEditingItem(null);
      setForm({ contentId: "", rank: "1" });
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(contentId) {
    if (!confirm("Remove this item from trending?")) return;
    try {
      const response = await fetch(`/api/admin/trending/${contentId}`, {
        method: "DELETE",
      });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Action failed");
      notify("Removed from trending");
      refresh();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <PageShell>
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => {
            setEditingItem(null);
            setForm({ contentId: "", rank: "1" });
            setOpen(true);
          }}
        >
          <Plus size={17} /> Add Trending Item
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) setEditingItem(null);
        }}
      >
        <DialogContent className="max-w-xl w-[min(640px,calc(100vw-32px))]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                {editingItem ? "Edit Trending Rank & Priority" : "Add Title to Trending Carousel"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Feature high-performing movies and series in the curated Trending lineup.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                  Select Content / Title <span className="text-red-500">*</span>
                </span>
                {editingItem ? (
                  <div className="p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/50 text-sm font-bold text-[var(--admin-foreground)]">
                    {editingItem.content?.title || "Selected Content"}
                  </div>
                ) : loadingContents ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="animate-spin text-[var(--admin-primary)]" size={20} />
                    <span className="text-xs text-[var(--admin-muted)]">Loading content catalog...</span>
                  </div>
                ) : (
                  <Select
                    value={form.contentId}
                    onChange={(e) =>
                      setForm({ ...form, contentId: e.target.value })
                    }
                    required
                    className="bg-[var(--admin-surface)] text-[var(--admin-foreground)] h-11 text-sm"
                  >
                    <option value="">-- Choose Video/Series --</option>
                    {contents.map((content) => (
                      <option
                        key={content._id || content.id}
                        value={content._id || content.id}
                      >
                        [{content.type?.toUpperCase()}] {content.title}
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                  Display Rank / Sequence Order <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.rank}
                  onChange={(e) => setForm({ ...form, rank: e.target.value })}
                  required
                  placeholder="1"
                  className="h-10 text-sm font-semibold"
                />
                <p className="text-[11px] text-[var(--admin-muted)]">
                  Lower numbers display first (e.g. Rank 1 displays as #1 Trending).
                </p>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditingItem(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !form.contentId}>
                {submitting
                  ? "Saving..."
                  : editingItem
                    ? "Save Changes"
                    : "Add Trending"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Trending Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <PinkLoader className="min-h-96" />
          ) : trendingItems.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                      <th className="px-3 py-3">Rank</th>
                      <th className="px-3 py-3">Content</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Added At</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendingItems.map((item) => (
                      <tr
                        key={item._id || item.id}
                        className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-soft)]"
                      >
                        <td className="px-3 py-4">
                          <input
                            type="number"
                            min="0"
                            defaultValue={item.rank}
                            onBlur={async (e) => {
                              const newRank = Number(e.target.value);
                              if (newRank === item.rank) return;
                              try {
                                const response = await fetch(
                                  `/api/admin/trending/${item.contentId}`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "content-type": "application/json",
                                    },
                                    body: JSON.stringify({ rank: newRank }),
                                  },
                                );
                                const payload =
                                  await readJsonResponse(response);
                                if (!response.ok || !payload.success)
                                  throw new Error(
                                    payload.message || "Failed to update rank",
                                  );
                                notify("Rank updated successfully");
                                refresh();
                              } catch (err) {
                                notify(err.message, "error");
                              }
                            }}
                            className="w-16 h-8 bg-white border border-[#f4c3d9] rounded text-center text-sm text-slate-900 font-bold"
                          />
                        </td>
                        <td className="px-3 py-4 font-semibold flex items-center gap-3">
                          <div className="grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded-[6px] bg-[var(--admin-soft)]">
                            {item.content?.posterUrl ||
                            item.content?.thumbnailUrl ? (
                              <img
                                src={
                                  item.content.posterUrl ||
                                  item.content.thumbnailUrl
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Activity
                                className="text-[var(--admin-primary)]"
                                size={18}
                              />
                            )}
                          </div>
                          <div>
                            <p>{item.content?.title || "Unknown title"}</p>
                            <p className="text-xs text-[var(--admin-muted)] max-w-sm truncate">
                              {item.content?.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-4 capitalize">
                          {item.content?.type || item.contentType}
                        </td>
                        <td className="px-3 py-4 text-[var(--admin-muted)]">
                          {item.addedAt ? formatDate(item.addedAt) : "-"}
                        </td>
                        <td className="px-3 py-4 flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingItem(item);
                              setForm({
                                contentId: item.contentId,
                                rank: String(item.rank),
                              });
                              setOpen(true);
                            }}
                            title="Edit Rank"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.contentId)}
                            title="Remove"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={data?.pagination} setPage={setPage} />
            </>
          ) : (
            <EmptyState
              icon={Activity}
              title="No trending items"
              description="Configure items to show up in the trending row."
            />
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function BlockbustersView({
  data,
  loading,
  filters,
  setFilters,
  setPage,
  refresh,
  notify,
}) {
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [contents, setContents] = useState([]);
  const [loadingContents, setLoadingContents] = useState(false);
  const [form, setForm] = useState({ contentId: "", rank: "1" });
  const [submitting, setSubmitting] = useState(false);

  const blockbusterItems = data?.blockbusters || [];

  async function loadContents() {
    setLoadingContents(true);
    try {
      const res = await apiFetch("/api/admin/videos?limit=100");
      setContents(res.videos || []);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoadingContents(false);
    }
  }

  useEffect(() => {
    if (open) {
      loadContents();
    }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.contentId) return notify("Please select content", "error");
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/admin/blockbusters/${form.contentId}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ rank: Number(form.rank) }),
        },
      );
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Action failed");

      notify(
        editingItem
          ? "Rank updated successfully"
          : "Content added to blockbusters",
      );
      setOpen(false);
      setEditingItem(null);
      setForm({ contentId: "", rank: "1" });
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(contentId) {
    if (!confirm("Remove this item from blockbusters?")) return;
    try {
      const response = await fetch(`/api/admin/blockbusters/${contentId}`, {
        method: "DELETE",
      });
      const payload = await readJsonResponse(response);
      if (!response.ok || !payload.success)
        throw new Error(payload.message || "Action failed");
      notify("Removed from blockbusters");
      refresh();
    } catch (err) {
      notify(err.message, "error");
    }
  }

  return (
    <PageShell>
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => {
            setEditingItem(null);
            setForm({ contentId: "", rank: "1" });
            setOpen(true);
          }}
        >
          <Plus size={17} /> Add Blockbuster Item
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) setEditingItem(null);
        }}
      >
        <DialogContent className="max-w-xl w-[min(640px,calc(100vw-32px))]">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold text-[var(--admin-foreground)]">
                {editingItem ? "Edit Blockbuster Rank & Priority" : "Add Blockbuster Feature"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[var(--admin-muted)] mt-1">
                Feature premier high-budget cinema and marquee titles on the Blockbuster shelf.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                  Select Content / Title <span className="text-red-500">*</span>
                </span>
                {editingItem ? (
                  <div className="p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)]/50 text-sm font-bold text-[var(--admin-foreground)]">
                    {editingItem.content?.title || "Selected Content"}
                  </div>
                ) : loadingContents ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="animate-spin text-[var(--admin-primary)]" size={20} />
                    <span className="text-xs text-[var(--admin-muted)]">Loading content catalog...</span>
                  </div>
                ) : (
                  <Select
                    value={form.contentId}
                    onChange={(e) =>
                      setForm({ ...form, contentId: e.target.value })
                    }
                    required
                    className="bg-[var(--admin-surface)] text-[var(--admin-foreground)] h-11 text-sm"
                  >
                    <option value="">-- Choose Video/Series --</option>
                    {contents.map((content) => (
                      <option
                        key={content._id || content.id}
                        value={content._id || content.id}
                      >
                        [{content.type?.toUpperCase()}] {content.title}
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)] block">
                  Display Rank / Sequence Order <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.rank}
                  onChange={(e) => setForm({ ...form, rank: e.target.value })}
                  required
                  placeholder="1"
                  className="h-10 text-sm font-semibold"
                />
                <p className="text-[11px] text-[var(--admin-muted)]">
                  Lower numbers appear first on the Blockbuster ribbon.
                </p>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditingItem(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !form.contentId}>
                {submitting
                  ? "Saving..."
                  : editingItem
                    ? "Save Changes"
                    : "Add Blockbuster"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Blockbuster Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <PinkLoader className="min-h-96" />
          ) : blockbusterItems.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-left text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                      <th className="px-3 py-3">Rank</th>
                      <th className="px-3 py-3">Content</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Added At</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockbusterItems.map((item) => (
                      <tr
                        key={item._id || item.id}
                        className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-soft)]"
                      >
                        <td className="px-3 py-4">
                          <input
                            type="number"
                            min="0"
                            defaultValue={item.rank}
                            onBlur={async (e) => {
                              const newRank = Number(e.target.value);
                              if (newRank === item.rank) return;
                              try {
                                const response = await fetch(
                                  `/api/admin/blockbusters/${item.contentId}`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "content-type": "application/json",
                                    },
                                    body: JSON.stringify({ rank: newRank }),
                                  },
                                );
                                const payload =
                                  await readJsonResponse(response);
                                if (!response.ok || !payload.success)
                                  throw new Error(
                                    payload.message || "Failed to update rank",
                                  );
                                notify("Rank updated successfully");
                                refresh();
                              } catch (err) {
                                notify(err.message, "error");
                              }
                            }}
                            className="w-16 h-8 bg-white border border-[#f4c3d9] rounded text-center text-sm text-slate-900 font-bold"
                          />
                        </td>
                        <td className="px-3 py-4 font-semibold flex items-center gap-3">
                          <div className="grid h-10 w-14 shrink-0 place-items-center overflow-hidden rounded-[6px] bg-[var(--admin-soft)]">
                            {item.content?.posterUrl ||
                            item.content?.thumbnailUrl ? (
                              <img
                                src={
                                  item.content.posterUrl ||
                                  item.content.thumbnailUrl
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Shield
                                className="text-[var(--admin-primary)]"
                                size={18}
                              />
                            )}
                          </div>
                          <div>
                            <p>{item.content?.title || "Unknown title"}</p>
                            <p className="text-xs text-[var(--admin-muted)] max-w-sm truncate">
                              {item.content?.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-4 capitalize">
                          {item.content?.type || item.contentType}
                        </td>
                        <td className="px-3 py-4 text-[var(--admin-muted)]">
                          {item.addedAt ? formatDate(item.addedAt) : "-"}
                        </td>
                        <td className="px-3 py-4 flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingItem(item);
                              setForm({
                                contentId: item.contentId,
                                rank: String(item.rank),
                              });
                              setOpen(true);
                            }}
                            title="Edit Rank"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.contentId)}
                            title="Remove"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={data?.pagination} setPage={setPage} />
            </>
          ) : (
            <EmptyState
              icon={Shield}
              title="No blockbuster items"
              description="Configure items to show up in the blockbuster row."
            />
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

function ArtistSearchDropdown({
  label,
  placeholder,
  selected = [], // Array of { _id, name, photo }
  onChange,
  type, // "actor" | "director" | "writer"
  disabled = false,
  notify,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef(null);

  // Search effect
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    let active = true;
    const fetchArtists = async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/artists?type=${type}&search=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        if (active && data.success) {
          setResults(data.artists || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setSearching(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchArtists();
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [query, type]);

  const handleSelect = (artist) => {
    if (selected.some((s) => s._id === artist._id)) {
      setQuery("");
      setIsOpen(false);
      return;
    }
    const next = [
      ...selected,
      { _id: artist._id, name: artist.name, photo: artist.photo },
    ];
    onChange(next);
    setQuery("");
    setIsOpen(false);
  };

  const handleRemove = (artistId) => {
    const next = selected.filter((s) => s._id !== artistId);
    onChange(next);
  };

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
        {label}
      </label>
      <div className="relative">
        <div className="flex h-10 w-full items-center justify-between rounded-[var(--radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-foreground)] outline-none transition focus-within:border-[var(--admin-primary)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--admin-primary)_18%,transparent)]">
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-transparent outline-none border-none p-0 text-sm focus:ring-0 text-[var(--admin-foreground)] placeholder-[var(--admin-muted)]"
          />
          {searching ? (
            <Loader2
              size={16}
              className="animate-spin text-[var(--admin-primary)] shrink-0"
            />
          ) : (
            <ChevronDown
              size={16}
              className="text-[var(--admin-muted)] shrink-0 cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            />
          )}
        </div>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1.5 shadow-lg">
              {results.map((artist) => (
                <button
                  key={artist._id}
                  type="button"
                  onClick={() => handleSelect(artist)}
                  className="flex w-full items-center gap-3 rounded-[4px] px-2.5 py-2 text-sm text-left hover:bg-[var(--admin-soft)] hover:text-[var(--admin-foreground)] cursor-pointer"
                >
                  <div className="h-7 w-7 shrink-0 rounded-full overflow-hidden bg-[var(--admin-soft)] border border-[var(--admin-border)]">
                    {artist.photo ? (
                      <img
                        src={artist.photo}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[var(--admin-accent)] text-white text-[10px] font-black">
                        {artist.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate text-[var(--admin-foreground)]">
                      {artist.name}
                    </p>
                    {artist.bio && (
                      <p className="text-[10px] text-[var(--admin-muted)] truncate">
                        {artist.bio}
                      </p>
                    )}
                  </div>
                </button>
              ))}

              {query.length >= 2 && results.length === 0 && !searching && (
                <div className="p-3 text-center text-xs text-[var(--admin-muted)] space-y-1">
                  <p>No matches found.</p>
                  <a
                    href="/admin/artists"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[var(--admin-primary)] hover:underline font-bold"
                  >
                    Create Artist in Artist Management ↗
                  </a>
                </div>
              )}
              {query.length < 2 && (
                <div className="p-3 text-center text-xs text-[var(--admin-muted)]">
                  Type 2 or more characters to search...
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Selected Chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-1.5 rounded-full bg-[var(--admin-soft)] border border-[var(--admin-border)] pl-1.5 pr-2 py-0.5 text-xs font-semibold text-[var(--admin-foreground)]"
            >
              <div className="h-5 w-5 shrink-0 rounded-full overflow-hidden bg-[var(--admin-border)]">
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[var(--admin-accent)] text-white text-[8px] font-bold">
                    {item.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <span>{item.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(item._id)}
                className="text-[var(--admin-muted)] hover:text-red-500 transition"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArtistsView({ data, loading, refresh, notify }) {
  const artistsList = data?.artists || [];
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    type: "actor",
    bio: "",
    photo: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || "",
        type: editing.type || "actor",
        bio: editing.bio || "",
        photo: editing.photo || "",
      });
      setPhotoPreview(editing.photo || "");
      setPhotoFile(null);
      setUploadProgress(0);
      setShowForm(true);
    } else {
      setForm({
        name: "",
        type: "actor",
        bio: "",
        photo: "",
      });
      setPhotoPreview("");
      setPhotoFile(null);
      setUploadProgress(0);
    }
  }, [editing]);

  // Client-side search & filter
  const filteredArtists = artistsList.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.bio &&
        artist.bio.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || artist.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Client-side pagination
  const totalPages = Math.ceil(filteredArtists.length / itemsPerPage) || 1;
  const paginatedArtists = filteredArtists.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setEditing(null);
    setShowForm(false);
    setForm({ name: "", type: "actor", bio: "", photo: "" });
    setPhotoPreview("");
    setPhotoFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return notify("Artist Name is required", "error");
    if (!form.type) return notify("Artist Type is required", "error");
    setSubmitting(true);

    try {
      let finalPhotoUrl = form.photo;

      // If a new photo file was selected, upload it to S3 first
      if (photoFile) {
        setUploadProgress(10);
        const uploadResult = await uploadToS3(photoFile, "artists", (prog) => {
          setUploadProgress(prog);
        });
        finalPhotoUrl = uploadResult.url;
      }

      const body = {
        name: form.name.trim(),
        type: form.type,
        bio: form.bio.trim(),
        photo: finalPhotoUrl,
      };

      const url = editing
        ? `/api/artists/${editing._id || editing.id}`
        : "/api/artists";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to save artist");
      }

      notify(
        editing ? "Artist updated successfully" : "Artist created successfully",
      );
      handleCancel();
      refresh();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (artist) => {
    if (!confirm(`Are you sure you want to delete ${artist.name}?`)) return;
    try {
      const res = await fetch(`/api/artists/${artist._id || artist.id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to delete artist");
      }
      notify("Artist deleted successfully");
      refresh();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <PageShell>
      {/* Title section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-foreground)]">
            Artist Management
          </h1>
          <p className="text-sm text-[var(--admin-muted)]">
            Manage actors, directors, and writers
          </p>
        </div>
        {!showForm && (
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1.5 font-bold"
          >
            <Plus size={16} /> Add Artist
          </Button>
        )}
      </div>

      {/* Inline Form Section */}
      {showForm && (
        <Card className="mb-6 overflow-hidden border border-[var(--admin-border)] relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--admin-primary)] to-[var(--admin-accent)]" />
          <CardHeader className="pb-2 pt-5">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus size={16} className="text-[var(--admin-primary)]" />
              <span>{editing ? "Edit Artist" : "Add New Artist"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Artist Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter artist name..."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Artist Type
                  </label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    disabled={submitting}
                    required
                  >
                    <option value="actor">Actor</option>
                    <option value="director">Director</option>
                    <option value="writer">Writer</option>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Bio / Description
                  </label>
                  <Textarea
                    placeholder="Enter short biography..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    disabled={submitting}
                    rows={4}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                    Photo Image
                  </label>
                  <div className="flex flex-col items-center gap-3 rounded-[8px] border border-dashed border-[var(--admin-border)] bg-[var(--admin-soft)]/20 p-3">
                    <div className="relative h-20 w-20 shrink-0">
                      <div className="h-full w-full overflow-hidden rounded-full border border-[var(--admin-border)] bg-[var(--admin-soft)]">
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[var(--admin-muted)]">
                            <User size={28} />
                          </div>
                        )}
                      </div>
                      {photoPreview && !submitting && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview("");
                            setForm((prev) => ({ ...prev, photo: "" }));
                          }}
                          className="absolute -top-1 -right-1 z-20 h-6 w-6 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          title="Remove photo"
                          aria-label="Remove photo"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="relative cursor-pointer rounded-[6px] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--admin-soft)] transition">
                        <span>{photoPreview ? "Change Photo" : "Choose File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          disabled={submitting}
                          className="sr-only"
                        />
                      </label>
                      {photoPreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview("");
                            setForm((prev) => ({ ...prev, photo: "" }));
                          }}
                          disabled={submitting}
                          className="text-red-500 hover:bg-red-500/10 hover:text-red-600 h-8 px-2 text-xs flex items-center gap-1"
                        >
                          <X size={13} />
                          <span>Remove</span>
                        </Button>
                      )}
                    </div>

                    {uploadProgress > 0 && (
                      <div className="w-full bg-[var(--admin-border)] rounded-full h-1 mt-1">
                        <div
                          className="bg-[var(--admin-primary)] h-1 rounded-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--admin-border)]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? "Saving..."
                    : editing
                      ? "Update Artist"
                      : "Add Artist"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List Card */}
      <Card className="border border-[var(--admin-border)]">
        <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 pt-5">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-[var(--admin-muted)]">
            Artist Directory
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-48 lg:w-64">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
                size={14}
              />
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            {/* Type Filter */}
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 text-xs w-32"
            >
              <option value="all">All Types</option>
              <option value="actor">Actors</option>
              <option value="director">Directors</option>
              <option value="writer">Writers</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <PinkLoader className="min-h-96" />
          ) : paginatedArtists.length === 0 ? (
            <EmptyState
              icon={User}
              title="No artists found"
              description="No artists match your criteria. Try creating a new one."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--admin-border)] text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">
                      <th className="px-4 py-3 w-16">Photo</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3 w-28">Type</th>
                      <th className="px-4 py-3">Biography</th>
                      <th className="px-4 py-3 w-24 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--admin-border)]">
                    {paginatedArtists.map((artist) => (
                      <tr
                        key={artist._id}
                        className="hover:bg-[var(--admin-soft)]/20 transition-colors group"
                      >
                        <td className="px-4 py-3.5">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--admin-border)] bg-[var(--admin-soft)]">
                            {artist.photo ? (
                              <img
                                src={artist.photo}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[var(--admin-muted)] bg-[var(--admin-soft)]">
                                <User size={18} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[var(--admin-foreground)]">
                          {artist.name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold capitalize",
                              artist.type === "actor"
                                ? "bg-cyan-500/10 text-cyan-500"
                                : artist.type === "director"
                                  ? "bg-rose-500/10 text-rose-500"
                                  : "bg-amber-500/10 text-amber-500",
                            )}
                          >
                            {artist.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[var(--admin-muted)] max-w-md truncate">
                          {artist.bio || "-"}
                        </td>
                        <td className="px-4 py-3.5 text-right flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]"
                            onClick={() => setEditing(artist)}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[var(--admin-muted)] hover:text-red-500"
                            onClick={() => handleDelete(artist)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination section */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-[var(--admin-border)]">
                  <Pagination
                    pagination={{
                      page,
                      totalPages,
                      total: filteredArtists.length,
                    }}
                    setPage={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
