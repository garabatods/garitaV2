import { useEffect, useRef, useState } from "react";
import garitaWatchMark from "./assets/garita-watch-mark.svg";

const API_URL = "/api/bwt";
const FAVORITES_KEY = "bwtFavorites";
const THEME_KEY = "garitaWatchV2Theme";
const GUIDANCE_CACHE_KEY = "garitaWatchV2DailyGuidanceCache";
const ALERT_DRAFTS_KEY = "garitaWatchV2AlertDrafts";
const DEFAULT_FAVORITES = ["250401", "250601", "250201"];
const INVALID_LANE_STATUSES = new Set([
  "",
  "N/A",
  "Lanes Closed",
  "Update Pending",
  "Waiting for update",
]);
const SUPABASE_URL = "https://ymlunuhplrcdemewtyxf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltbHVudWhwbHJjZGVtZXd0eXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MDUxNzgsImV4cCI6MjA4NzQ4MTE3OH0.53eYzkPUVy26rDfsIhuew34MzBRMSiAi1LwX5ku-PEo";
const LANE_HISTORY_PORT_FALLBACKS = {
  "250609": "250601",
};
const PORT_COORDINATES = {
  "230101": { lat: 28.7091, lng: -100.4995 },
  "230102": { lat: 28.7029, lng: -100.4891 },
  "230201": { lat: 29.3759, lng: -100.8975 },
  "230301": { lat: 29.5602, lng: -104.3681 },
  "240201": { lat: 31.7586, lng: -106.454 },
  "240204": { lat: 31.7599, lng: -106.4484 },
  "240205": { lat: 31.6939, lng: -106.3013 },
  "240206": { lat: 31.7671, lng: -106.4275 },
  "240207": { lat: 31.7586, lng: -106.454 },
  "240208": { lat: 31.7671, lng: -106.4275 },
  "240210": { lat: 31.6939, lng: -106.3013 },
  "240212": { lat: 31.4255, lng: -105.8541 },
  "240215": { lat: 31.7586, lng: -106.454 },
  "240301": { lat: 31.139, lng: -105.0044 },
  "240401": { lat: 31.0952, lng: -105.0065 },
  "240501": { lat: 31.7875, lng: -106.6552 },
  "240601": { lat: 31.827, lng: -107.6356 },
  "250201": { lat: 32.7194, lng: -114.6997 },
  "250301": { lat: 32.6781, lng: -115.4988 },
  "250302": { lat: 32.6743, lng: -115.4992 },
  "250401": { lat: 32.5412, lng: -117.0322 },
  "250407": { lat: 32.5425, lng: -117.0346 },
  "250409": { lat: 32.5413, lng: -116.9769 },
  "250501": { lat: 32.5493, lng: -116.6289 },
  "250601": { lat: 32.5503, lng: -116.9386 },
  "250602": { lat: 32.5503, lng: -116.9386 },
  "250608": { lat: 32.5503, lng: -116.9386 },
  "250609": { lat: 32.5503, lng: -116.9386 },
  "260101": { lat: 31.3338, lng: -109.5454 },
  "260201": { lat: 31.9505, lng: -112.8061 },
  "260302": { lat: 31.3361, lng: -109.948 },
  "260401": { lat: 31.3405, lng: -110.9372 },
  "260402": { lat: 31.3398, lng: -110.9357 },
  "260403": { lat: 31.3396, lng: -110.9362 },
  "260501": { lat: 31.4828, lng: -111.5476 },
  "260601": { lat: 32.487, lng: -114.7826 },
  "260602": { lat: 32.4859, lng: -114.7731 },
  "535501": { lat: 25.9017, lng: -97.4975 },
  "535502": { lat: 25.9773, lng: -97.5594 },
  "535503": { lat: 26.0476, lng: -97.6619 },
  "535504": { lat: 25.901, lng: -97.5034 },
  "580101": { lat: 27.5006, lng: -99.5069 },
  "580102": { lat: 27.5016, lng: -99.5076 },
  "580103": { lat: 27.5025, lng: -99.4901 },
  "580104": { lat: 27.5009, lng: -99.4965 },
  "580201": { lat: 26.1948, lng: -97.6962 },
  "580301": { lat: 26.3809, lng: -98.8215 },
  "580302": { lat: 26.405, lng: -99.0162 },
  "580401": { lat: 26.1004, lng: -98.2383 },
  "580402": { lat: 26.0875, lng: -98.2602 },
};

const SIDEBAR_ITEMS = [
  { id: "allPorts", label: "All Ports" },
  { id: "favorites", label: "Favorites" },
  { id: "trends", label: "Trends" },
  { id: "alerts", label: "Alerts", disabled: true },
  { id: "settings", label: "Settings", disabled: true },
];
const ALERT_TEXT = {
  currentWait: "Current wait",
  duplicate: "An identical alert already exists for this port.",
  empty: "There is no live data for that lane combination.",
  enableNotifications: "Enable notifications",
  enableNotificationsPrompt: "Enable notifications to receive alerts in this browser before your wait-time alert triggers.",
  invalidThreshold: "Enter a valid time between 0 and 600 minutes.",
  noSaved: "No alerts for this lane yet.",
  pushDenied: "Notifications are blocked in this browser.",
  pushEnableError: "Could not enable notifications.",
  pushEnabled: "Notifications are active in this browser.",
  pushEnabling: "Enabling notifications...",
  pushToastOpen: "Open",
  pushRequired: "Enable notifications in this browser to save alerts.",
  save: "Set alert",
  saveError: "Could not save the alert.",
  saveSuccess: "Alert saved.",
  savedLabel: "Active alerts",
  sectionSubtitle: "Pick a lane, choose your target wait, and we’ll notify you when it drops.",
  sectionTitle: "Wait time alerts",
  thresholdLabel: "Alert me when it drops below",
  unsupported: "This browser does not support web push notifications.",
  waiting: "Connecting alerts...",
};

function loadFavoriteIds() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.warn("Unable to read favorites for V2:", error);
  }

  return DEFAULT_FAVORITES;
}

function loadTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }
  } catch (error) {
    console.warn("Unable to read V2 theme preference:", error);
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

function loadAlertDrafts() {
  try {
    const raw = localStorage.getItem(ALERT_DRAFTS_KEY);
    const parsed = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.warn("Unable to read V2 alert drafts:", error);
    return {};
  }
}

function getSupabaseClient() {
  return window.garitaWatchSupabase || null;
}

function getPushBridge() {
  return window.garitaWatchPush || null;
}

function getInstallationId() {
  return window.garitaWatchInstallationId || null;
}

function normalizeV2Link(link, portNumber = "") {
  const targetPort = `${portNumber || ""}`.trim();
  const search = targetPort ? `?port=${encodeURIComponent(targetPort)}` : "";

  try {
    const resolved = new URL(link || "/", window.location.origin);
    const isRootTarget = resolved.pathname === "/" || resolved.pathname === "";
    if (isRootTarget) {
      return `${window.location.origin}/v2/${search}`;
    }

    if (resolved.pathname.startsWith("/v2")) {
      if (targetPort) {
        resolved.searchParams.set("port", targetPort);
      }
      return resolved.toString();
    }

    return `${window.location.origin}/v2/${search}`;
  } catch {
    return `${window.location.origin}/v2/${search}`;
  }
}

function loadScript(src, { module = false } = {}) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-v2-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.v2Src = src;
    if (module) {
      script.type = "module";
    }
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
    document.body.appendChild(script);
  });
}

async function ensureSupportScriptsLoaded() {
  await loadScript("/firebase-config.js");
  await loadScript("/supabase-init.js", { module: true });
  await loadScript("/firebase-init.js", { module: true });
}

function readGuidanceCache() {
  try {
    const raw = localStorage.getItem(GUIDANCE_CACHE_KEY);
    const parsed = JSON.parse(raw || "null");
    if (!parsed || !Array.isArray(parsed.rows)) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Unable to read V2 guidance cache:", error);
    return null;
  }
}

function writeGuidanceCache(snapshot) {
  try {
    if (!snapshot || !Array.isArray(snapshot.rows) || snapshot.rows.length === 0) {
      localStorage.removeItem(GUIDANCE_CACHE_KEY);
      return;
    }

    localStorage.setItem(GUIDANCE_CACHE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn("Unable to store V2 guidance cache:", error);
  }
}

function normalizeGuidanceSnapshot(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      expiresAt: null,
      generatedAt: null,
      rows: [],
    };
  }

  return {
    expiresAt: rows[0]?.expires_at || null,
    generatedAt: rows[0]?.generated_at || null,
    rows,
  };
}

function isGuidanceFresh(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.rows) || snapshot.rows.length === 0) {
    return false;
  }

  const expiresAt = snapshot.expiresAt ? Date.parse(snapshot.expiresAt) : NaN;
  if (Number.isFinite(expiresAt)) {
    return Date.now() < expiresAt;
  }

  const generatedAt = snapshot.generatedAt ? Date.parse(snapshot.generatedAt) : NaN;
  return Number.isFinite(generatedAt) && Date.now() - generatedAt < 24 * 60 * 60 * 1000;
}

async function rpcRequest(functionName, body) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase RPC failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}

function laneComparisonKey(travelMode, laneType) {
  return `${travelMode}:${laneType}`;
}

function portNumbersForLookup(portNumber) {
  const fallbackPortNumber = LANE_HISTORY_PORT_FALLBACKS[portNumber];
  return fallbackPortNumber && fallbackPortNumber !== portNumber
    ? [portNumber, fallbackPortNumber]
    : [portNumber];
}

async function fetchComparisonRows() {
  const cached = readGuidanceCache();
  if (isGuidanceFresh(cached)) {
    return cached.rows;
  }

  try {
    const guidanceRows = await rpcRequest("get_current_port_lane_daily_guidance", {
      in_port_number: null,
    });
    const snapshot = normalizeGuidanceSnapshot(guidanceRows || []);
    writeGuidanceCache(snapshot);
    if (snapshot.rows.length > 0) {
      return snapshot.rows;
    }
  } catch (error) {
    console.warn("Unable to fetch V2 daily guidance snapshot:", error);
  }

  return await rpcRequest("get_lane_wait_comparison", {
    in_lane_type: null,
    in_lookback_days: 7,
    in_minimum_samples: 12,
    in_port_number: null,
    in_travel_mode: null,
  });
}

function text(parent, tagName) {
  return parent?.getElementsByTagName(tagName)?.[0]?.textContent?.trim() || "";
}

function parseLane(node) {
  if (!node) return null;

  const operationalStatus = text(node, "operational_status");
  const delayText = text(node, "delay_minutes");
  const lanesOpen = text(node, "lanes_open");
  const delayMinutes = Number.parseInt(delayText, 10);

  return {
    delayMinutes: Number.isFinite(delayMinutes) ? delayMinutes : null,
    lanesOpen: Number.parseInt(lanesOpen, 10) || 0,
    operationalStatus,
    unavailable: INVALID_LANE_STATUSES.has(operationalStatus),
  };
}

function isActionableLane(lane) {
  return Boolean(
    lane &&
      !lane.unavailable &&
      Number.isFinite(lane.delayMinutes),
  );
}

function hasActionableLaneGroup(lanes) {
  if (!lanes) {
    return false;
  }

  return (
    isActionableLane(lanes.standard) ||
    isActionableLane(lanes.nexus_sentri) ||
    isActionableLane(lanes.ready)
  );
}

function parseFeed(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  const portNodes = Array.from(xmlDoc.getElementsByTagName("port"));
  const lastUpdatedDate = text(xmlDoc, "last_updated_date");
  const lastUpdatedTime = text(xmlDoc, "last_updated_time");

  const ports = portNodes
    .filter((portNode) => text(portNode, "border") === "Mexican Border")
    .map((portNode) => {
      const portNumber = text(portNode, "port_number");
      const portCoordinates = PORT_COORDINATES[portNumber] || {};
      const passenger = portNode.getElementsByTagName("passenger_vehicle_lanes")[0];
      const pedestrian = portNode.getElementsByTagName("pedestrian_lanes")[0];
      const subtitleParts = [
        text(portNode, "city"),
        text(portNode, "crossing_name"),
      ].filter(Boolean);

      const lanes = {
        standard: parseLane(passenger?.getElementsByTagName("standard_lanes")[0]),
        ready: parseLane(passenger?.getElementsByTagName("ready_lanes")[0]),
        nexus_sentri: parseLane(passenger?.getElementsByTagName("NEXUS_SENTRI_lanes")[0]),
      };

      const pedestrianLanes = {
        standard: parseLane(pedestrian?.getElementsByTagName("standard_lanes")[0]),
        ready: parseLane(pedestrian?.getElementsByTagName("ready_lanes")[0]),
      };

      return {
        city: text(portNode, "city"),
        crossingName: text(portNode, "crossing_name"),
        hours: text(portNode, "hours"),
        lat: portCoordinates.lat ?? null,
        lng: portCoordinates.lng ?? null,
        name: text(portNode, "port_name"),
        portNumber,
        portStatus: text(portNode, "port_status"),
        pedestrianLanes,
        subtitle: subtitleParts.join(" · "),
        updatedTime: text(portNode, "update_time"),
        lanes,
      };
    })
    .filter((port) => hasActionableLaneGroup(port.lanes) || hasActionableLaneGroup(port.pedestrianLanes));

  return {
    ports,
  };
}

function formatMinutes(value) {
  if (!Number.isFinite(value) || value === null) {
    return "--";
  }

  if (value === 0) {
    return "No Delay";
  }

  return String(value).padStart(2, "0");
}

function formatAlertWait(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return "N/A";
  }

  return minutes === 0 ? "No Delay" : `${minutes} min`;
}

function getWaitTone(minutes) {
  if (!Number.isFinite(minutes)) {
    return "default";
  }

  if (minutes <= 0) {
    return "no-delay";
  }

  if (minutes <= 15) {
    return "green";
  }

  if (minutes <= 30) {
    return "yellow";
  }

  if (minutes <= 60) {
    return "orange";
  }

  return "red";
}

function getPrimaryWait(port) {
  const waits = [
    port.lanes.standard,
    port.lanes.nexus_sentri,
    port.lanes.ready,
    port.pedestrianLanes?.standard,
    port.pedestrianLanes?.ready,
  ]
    .map((lane) => lane?.delayMinutes)
    .filter((value) => Number.isFinite(value));

  if (waits.length === 0) {
    return Infinity;
  }

  return Math.min(...waits);
}

function getTrendPill(comparison) {
  if (!comparison || comparison.trend_label === "not_enough_data") {
    return null;
  }

  if (comparison.trend_label === "faster_than_usual") {
    return { label: "Faster than usual", tone: "faster" };
  }

  if (comparison.trend_label === "slower_than_usual") {
    return { label: "Slower than usual", tone: "slower" };
  }

  if (comparison.trend_label === "about_normal") {
    return { label: "About normal", tone: "normal" };
  }

  return null;
}

function getTravelModeTitle(travelMode) {
  if (travelMode === "pedestrian") {
    return "Pedestrians";
  }

  if (travelMode === "commercial") {
    return "Commercial Vehicles";
  }

  return "Passenger Vehicles";
}

function getLaneTypeTitle(laneType) {
  if (laneType === "nexus_sentri") {
    return "Sentri";
  }

  if (laneType === "ready") {
    return "Ready Lane";
  }

  if (laneType === "fast") {
    return "FAST";
  }

  return "Standard";
}

function getBestHoursEntries(comparison) {
  if (!Array.isArray(comparison?.best_hours_json) || comparison.best_hours_json.length === 0) {
    return [];
  }

  return comparison.best_hours_json
    .map((entry) => {
      const hour = Number.parseInt(entry?.hour, 10);
      const averageDelayMinutes = typeof entry?.average_delay_minutes === "number"
        ? entry.average_delay_minutes
        : Number.parseFloat(entry?.average_delay_minutes);

      if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
        return null;
      }

      return {
        averageDelayMinutes: Number.isFinite(averageDelayMinutes) ? averageDelayMinutes : null,
        hour,
        sampleCount: Number.parseInt(entry?.sample_count, 10) || 0,
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.hour - right.hour);
}

function formatBestHour(hour) {
  try {
    const date = new Date(Date.UTC(2000, 0, 1, hour, 0, 0));
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  }
}

function haversine(lat1, lng1, lat2, lng2) {
  const radiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getPortDistanceKm(userLocation, port) {
  if (
    !userLocation ||
    !Number.isFinite(userLocation.lat) ||
    !Number.isFinite(userLocation.lng) ||
    !port ||
    !Number.isFinite(port.lat) ||
    !Number.isFinite(port.lng)
  ) {
    return Infinity;
  }

  return haversine(userLocation.lat, userLocation.lng, port.lat, port.lng);
}

function compareTrendItems(left, right, userLocation, tieBreaker) {
  if (left.isFavorite !== right.isFavorite) {
    return left.isFavorite ? -1 : 1;
  }

  if (userLocation) {
    const leftDistance = left.distanceKm ?? Infinity;
    const rightDistance = right.distanceKm ?? Infinity;

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance;
    }
  }

  return tieBreaker(left, right);
}

function normalizeTrendRows(rows, ports, favoriteIds, searchText, userLocation) {
  const portLookup = ports.reduce((acc, port) => {
    acc[port.portNumber] = port;
    return acc;
  }, {});

  return (rows || [])
    .map((row) => {
      const port = portLookup[row.port_number];
      const trendPill = getTrendPill(row);
      const bestHours = getBestHoursEntries(row);
      const currentDelayMinutes = Number.isFinite(row.current_delay_minutes)
        ? row.current_delay_minutes
        : (Number.isFinite(row.delay_minutes) ? row.delay_minutes : null);
      const usualDelayMinutes = Number.isFinite(row.usual_delay_minutes) ? row.usual_delay_minutes : null;
      const deltaMinutes = Number.isFinite(row.delta_minutes)
        ? row.delta_minutes
        : (Number.isFinite(currentDelayMinutes) && Number.isFinite(usualDelayMinutes)
          ? currentDelayMinutes - usualDelayMinutes
          : null);
      const travelLabel = getTravelModeTitle(row.travel_mode);
      const laneLabel = getLaneTypeTitle(row.lane_type);
      const portName = port?.name || row.port_name || "Unknown Crossing";
      const subtitle = port?.subtitle || row.crossing_name || "Mexico Border crossing";
      const distanceKm = getPortDistanceKm(userLocation, port);

      return {
        bestHours,
        comparison: row,
        currentDelayMinutes,
        distanceKm,
        deltaMinutes,
        isFavorite: favoriteIds.includes(row.port_number),
        key: `${row.port_number}:${row.travel_mode}:${row.lane_type}`,
        laneLabel,
        laneType: row.lane_type,
        port,
        portName,
        portNumber: row.port_number,
        subtitle,
        travelLabel,
        travelMode: row.travel_mode,
        trendPill,
        trendLabel: row.trend_label,
        usualDelayMinutes,
      };
    })
    .filter((item) => {
      const haystack = `${item.portName} ${item.subtitle} ${item.travelLabel} ${item.laneLabel}`.toLowerCase();
      return haystack.includes(searchText.toLowerCase());
    });
}

function sortPorts(ports, sortMode) {
  const nextPorts = [...ports];

  if (sortMode === "alphabetical") {
    nextPorts.sort((left, right) => left.name.localeCompare(right.name));
    return nextPorts;
  }

  if (sortMode === "distance") {
    nextPorts.sort((left, right) => left.subtitle.localeCompare(right.subtitle));
    return nextPorts;
  }

  nextPorts.sort((left, right) => getPrimaryWait(left) - getPrimaryWait(right));
  return nextPorts;
}

function SidebarIcon({ type }) {
  const paths = {
    allPorts: "M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h5v8H3v-8Zm7 0h11v8H10v-8Z",
    alerts: "M12 2a4 4 0 0 0-4 4v2.1A7 7 0 0 0 5 14v1l-1 2h16l-1-2v-1a7 7 0 0 0-3-5.9V6a4 4 0 0 0-4-4Zm0 20a3 3 0 0 0 2.82-2H9.18A3 3 0 0 0 12 22Z",
    favorites: "m12 2.5 2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52 6.12 20.6l1.12-6.55L2.48 9.42l6.58-.96L12 2.5Z",
    settings: "M10.33 2h3.34l.63 2.55a7.95 7.95 0 0 1 1.77.73l2.22-1.18 2.36 2.36-1.18 2.22c.3.56.55 1.15.73 1.77L22 10.33v3.34l-2.55.63a7.95 7.95 0 0 1-.73 1.77l1.18 2.22-2.36 2.36-2.22-1.18a7.95 7.95 0 0 1-1.77.73L13.67 22h-3.34l-.63-2.55a7.95 7.95 0 0 1-1.77-.73l-2.22 1.18-2.36-2.36 1.18-2.22a7.95 7.95 0 0 1-.73-1.77L2 13.67v-3.34l2.55-.63c.18-.62.43-1.21.73-1.77L4.1 5.71 6.46 3.35l2.22 1.18c.56-.3 1.15-.55 1.77-.73L10.33 2Zm1.67 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
    trends: "M4 16.5 9.5 11l3 3L20 6.5 22 8.5l-9.5 9.5-3-3L6 18.5 4 16.5Z",
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={paths[type]} />
    </svg>
  );
}

function UiIcon({ type }) {
  const paths = {
    moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
    sun: "M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 12a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V17.5a1 1 0 0 1 1-1Zm7.5-5.5a1 1 0 0 1 1 1 1 1 0 0 1-1 1H18a1 1 0 1 1 0-2h1.5ZM6 12a1 1 0 0 1-1 1H3.5a1 1 0 1 1 0-2H5a1 1 0 0 1 1 1Zm9.19-4.19a1 1 0 0 1 0-1.41l1.06-1.06a1 1 0 0 1 1.41 1.41L16.6 7.81a1 1 0 0 1-1.41 0Zm-7.78 7.78a1 1 0 0 1 0-1.41l1.06-1.06a1 1 0 1 1 1.41 1.41l-1.06 1.06a1 1 0 0 1-1.41 0Zm8.84-1.41a1 1 0 0 1 1.41 0l1.06 1.06a1 1 0 1 1-1.41 1.41l-1.06-1.06a1 1 0 0 1 0-1.41ZM7.41 8.81A1 1 0 0 1 6 8.81L4.94 7.75a1 1 0 0 1 1.41-1.41l1.06 1.06a1 1 0 0 1 0 1.41ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z",
  };

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d={paths[type]} fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40">
      <path
        d="M35 35L27.75 27.75M31.6667 18.3333C31.6667 25.6971 25.6971 31.6667 18.3333 31.6667C10.9695 31.6667 5 25.6971 5 18.3333C5 10.9695 10.9695 5 18.3333 5C25.6971 5 31.6667 10.9695 31.6667 18.3333Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
    </svg>
  );
}

function FavoriteStarIcon({ filled = false }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="m12 2.85 2.66 5.39 5.95.87-4.3 4.19 1.01 5.92L12 16.44 6.68 19.22l1.01-5.92-4.3-4.19 5.95-.87L12 2.85Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TravelModeIcon({ travelMode }) {
  if (travelMode === "pedestrian") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
    </svg>
  );
}

function DarkModeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 38 38">
      <path
        d="M19 33.25C15.0417 33.25 11.6771 31.8646 8.90625 29.0938C6.13542 26.3229 4.75 22.9583 4.75 19C4.75 15.0417 6.13542 11.6771 8.90625 8.90625C11.6771 6.13542 15.0417 4.75 19 4.75C19.3694 4.75 19.7323 4.76319 20.0885 4.78958C20.4448 4.81597 20.7944 4.85556 21.1375 4.90833C20.0556 5.67361 19.1913 6.66979 18.5448 7.89688C17.8983 9.12396 17.575 10.45 17.575 11.875C17.575 14.25 18.4063 16.2688 20.0688 17.9312C21.7313 19.5938 23.75 20.425 26.125 20.425C27.5764 20.425 28.909 20.1017 30.1229 19.4552C31.3368 18.8087 32.3264 17.9444 33.0917 16.8625C33.1444 17.2056 33.184 17.5552 33.2104 17.9115C33.2368 18.2677 33.25 18.6306 33.25 19C33.25 22.9583 31.8646 26.3229 29.0938 29.0938C26.3229 31.8646 22.9583 33.25 19 33.25ZM19 30.0833C21.3222 30.0833 23.4069 29.4434 25.2542 28.1635C27.1014 26.8837 28.4472 25.2146 29.2917 23.1562C28.7639 23.2882 28.2361 23.3937 27.7083 23.4729C27.1806 23.5521 26.6528 23.5917 26.125 23.5917C22.8792 23.5917 20.1149 22.4503 17.8323 20.1677C15.5497 17.8851 14.4083 15.1208 14.4083 11.875C14.4083 11.3472 14.4479 10.8194 14.5271 10.2917C14.6063 9.76389 14.7118 9.23611 14.8438 8.70833C12.7854 9.55278 11.1163 10.8986 9.83646 12.7458C8.5566 14.5931 7.91667 16.6778 7.91667 19C7.91667 22.0611 8.99861 24.6736 11.1625 26.8375C13.3264 29.0014 15.9389 30.0833 19 30.0833Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LightModeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 38 38">
      <path
        d="M18.9997 23.75C20.3191 23.75 21.4406 23.2882 22.3643 22.3646C23.2879 21.441 23.7497 20.3195 23.7497 19C23.7497 17.6806 23.2879 16.559 22.3643 15.6354C21.4406 14.7118 20.3191 14.25 18.9997 14.25C17.6802 14.25 16.5587 14.7118 15.6351 15.6354C14.7115 16.559 14.2497 17.6806 14.2497 19C14.2497 20.3195 14.7115 21.441 15.6351 22.3646C16.5587 23.2882 17.6802 23.75 18.9997 23.75ZM18.9997 26.9167C16.8094 26.9167 14.9424 26.1448 13.3986 24.6011C11.8549 23.0573 11.083 21.1903 11.083 19C11.083 16.8097 11.8549 14.9427 13.3986 13.399C14.9424 11.8552 16.8094 11.0833 18.9997 11.0833C21.19 11.0833 23.057 11.8552 24.6007 13.399C26.1445 14.9427 26.9163 16.8097 26.9163 19C26.9163 21.1903 26.1445 23.0573 24.6007 24.6011C23.057 26.1448 21.19 26.9167 18.9997 26.9167ZM7.91634 20.5833H1.58301V17.4167H7.91634V20.5833ZM36.4163 20.5833H30.083V17.4167H36.4163V20.5833ZM17.4163 7.91668V1.58334H20.583V7.91668H17.4163ZM17.4163 36.4167V30.0833H20.583V36.4167H17.4163ZM10.133 12.2708L6.13509 8.43126L8.39134 6.09584L12.1913 10.0542L10.133 12.2708ZM29.608 31.9042L25.7684 27.9063L27.8663 25.7292L31.8643 29.5688L29.608 31.9042ZM25.7288 10.1333L29.5684 6.13543L31.9038 8.39168L27.9455 12.1917L25.7288 10.1333ZM6.09551 29.6083L10.0934 25.7688L12.2705 27.8667L8.43092 31.8646L6.09551 29.6083Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ToastAlertIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 2.5a4.5 4.5 0 0 0-4.5 4.5v2.35a7.22 7.22 0 0 1-1.67 4.63L4.5 15.6v1.15h15V15.6l-1.33-1.62a7.22 7.22 0 0 1-1.67-4.63V7A4.5 4.5 0 0 0 12 2.5Zm0 19a2.9 2.9 0 0 0 2.73-1.85H9.27A2.9 2.9 0 0 0 12 21.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StatCell({ label, lane }) {
  const minutes = lane?.delayMinutes;
  const waitTone = getWaitTone(minutes);
  const isNoDelay = minutes === 0;

  return (
    <div className="stat-cell">
      <span className="stat-label">{label}</span>
      <div className={`stat-value stat-value--${waitTone} ${isNoDelay ? "stat-value--no-delay" : ""}`}>
        <strong>{formatMinutes(minutes)}</strong>
        {isNoDelay ? null : <span>min</span>}
      </div>
    </div>
  );
}

function getVisibleLaneStats(laneGroup, travelMode) {
  const laneDefinitions = travelMode === "pedestrian"
    ? [
        { id: "standard", label: "Standard", lane: laneGroup?.standard },
        { id: "ready", label: "Ready Lane", lane: laneGroup?.ready },
      ]
    : [
        { id: "standard", label: "Standard", lane: laneGroup?.standard },
        { id: "nexus_sentri", label: "Sentri", lane: laneGroup?.nexus_sentri },
        { id: "ready", label: "Ready Lane", lane: laneGroup?.ready },
      ];

  return laneDefinitions.filter((entry) => isActionableLane(entry.lane));
}

function getVisibleTravelGroups(port) {
  const groups = [
    {
      entries: getVisibleLaneStats(port.lanes, "passenger"),
      title: "Passenger Vehicles",
      travelMode: "passenger",
    },
    {
      entries: getVisibleLaneStats(port.pedestrianLanes, "pedestrian"),
      title: "Pedestrians",
      travelMode: "pedestrian",
    },
  ];

  return groups.filter((group) => group.entries.length > 0);
}

function getAlertLaneEntries(port) {
  return getVisibleTravelGroups(port).flatMap((group) =>
    group.entries.map((entry) => ({
      currentWait: entry.lane?.delayMinutes ?? null,
      laneLabel: entry.label,
      laneType: entry.id,
      travelLabel: group.title,
      travelMode: group.travelMode,
    })),
  );
}

function getAlertDraftKey(travelMode, laneType) {
  return `${travelMode}:${laneType}`;
}

function getCardTrend(port, comparisonRows) {
  const preferredLaneOrder = [
    { laneTypes: ["standard", "nexus_sentri", "ready"], travelMode: "passenger" },
    { laneTypes: ["standard", "ready"], travelMode: "pedestrian" },
  ];
  const lookupPortNumbers = portNumbersForLookup(port.portNumber);

  for (const group of preferredLaneOrder) {
    for (const laneType of group.laneTypes) {
      for (const lookupPortNumber of lookupPortNumbers) {
        const comparison = comparisonRows[`${lookupPortNumber}:${laneComparisonKey(group.travelMode, laneType)}`];
        const pill = getTrendPill(comparison);
        if (pill) {
          return pill;
        }
      }
    }
  }

  return null;
}

function AlertLaneCard({
  activeAlerts,
  busy,
  currentWait,
  draftValue,
  laneLabel,
  laneType,
  onChangeDraft,
  onDeleteAlert,
  onSaveAlert,
  travelLabel,
  travelMode,
}) {
  const waitTone = getWaitTone(currentWait);

  return (
    <article className="modal-alert-card">
      <div className="modal-alert-card__header">
        <div className="modal-alert-card__copy">
          <p className="modal-alert-card__eyebrow">{travelLabel}</p>
          <h4 className="modal-alert-card__title">{laneLabel}</h4>
        </div>
        <div className="modal-alert-card__wait-wrap">
          <span className="modal-alert-card__wait-label">{ALERT_TEXT.currentWait}</span>
          <span className={`modal-alert-card__wait modal-alert-card__wait--${waitTone}`}>
            {formatAlertWait(currentWait)}
          </span>
        </div>
      </div>

      <div className="modal-alert-card__controls">
        <label className="modal-alert-card__threshold">
          <span>{ALERT_TEXT.thresholdLabel}</span>
          <div className="modal-alert-threshold-wrap">
            <input
              type="number"
              min="0"
              max="600"
              step="5"
              inputMode="numeric"
              value={draftValue}
              onChange={(event) => onChangeDraft(travelMode, laneType, event.target.value)}
            />
            <span className="modal-alert-threshold-unit">min</span>
          </div>
        </label>
        <button
          className="modal-alert-card__submit"
          type="button"
          disabled={busy}
          onClick={() => onSaveAlert(travelMode, laneType, draftValue)}
        >
          {busy ? "Saving..." : ALERT_TEXT.save}
        </button>
      </div>

      <div className="modal-alert-card__saved">
        {activeAlerts.length > 0 ? (
          <>
            <span className="modal-alert-card__saved-label">{ALERT_TEXT.savedLabel}</span>
            <div className="modal-alert-pill-list">
              {activeAlerts.map((alert) => (
                <span key={alert.id} className="modal-alert-pill">
                  <span>{`< ${alert.threshold_minutes} min`}</span>
                  <button
                    className="modal-alert-pill__delete"
                    type="button"
                    onClick={() => onDeleteAlert(alert.id)}
                    aria-label={`Delete ${laneLabel} alert under ${alert.threshold_minutes} minutes`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </>
        ) : (
          <span className="modal-alert-card__empty">{ALERT_TEXT.noSaved}</span>
        )}
      </div>
    </article>
  );
}

function TravelGroupSection({ entries, title, travelMode }) {
  return (
    <section className="travel-group-section">
      <div className="travel-group-section__header">
        <TravelModeIcon travelMode={travelMode} />
        <span>{title}</span>
      </div>
      <div
        className="travel-group-section__stats"
        style={{
          gridTemplateColumns: `repeat(${Math.max(entries.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {entries.map((entry) => (
          <StatCell key={entry.id} label={entry.label} lane={entry.lane} />
        ))}
      </div>
    </section>
  );
}

function FavoriteCard({
  comparisonRows,
  isFavorite,
  onOpen,
  onToggleFavorite,
  port,
}) {
  const visibleTravelGroups = getVisibleTravelGroups(port);
  const trendPill = getCardTrend(port, comparisonRows);

  return (
    <article
      className="favorite-card favorite-card--interactive"
      onClick={() => onOpen(port)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(port);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="favorite-card__glow" aria-hidden="true" />
      <div className="favorite-card__header">
        <div>
          <div className="favorite-card__title-row">
            <h2>{port.name || "Unknown Crossing"}</h2>
            <button
              className={`favorite-card__favorite-star ${isFavorite ? "is-favorite" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(port.portNumber);
              }}
              type="button"
              aria-label={`${isFavorite ? "Remove" : "Add"} ${port.name} ${isFavorite ? "from" : "to"} favorites`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <FavoriteStarIcon filled={isFavorite} />
            </button>
          </div>
          <p>{port.subtitle || "Mexico Border crossing"}</p>
        </div>
        <div className="favorite-card__meta">
          {trendPill ? (
            <span className={`traffic-pill traffic-pill--${trendPill.tone}`}>{trendPill.label}</span>
          ) : null}
        </div>
      </div>

      <div className="favorite-card__groups">
        {visibleTravelGroups.map((group) => (
          <TravelGroupSection
            key={group.travelMode}
            entries={group.entries}
            title={group.title}
            travelMode={group.travelMode}
          />
        ))}
      </div>
    </article>
  );
}

function TrendsSummaryCard({ caption, label, tone, value }) {
  return (
    <article className={`trends-summary-card trends-summary-card--${tone}`}>
      <span className="trends-summary-card__caption">{caption}</span>
      <strong>{value}</strong>
      <span className="trends-summary-card__label">{label}</span>
    </article>
  );
}

function BestTimesCard({ item, onOpen }) {
  return (
    <article
      className="best-times-card"
      onClick={() => item.port && onOpen(item.port)}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && item.port) {
          event.preventDefault();
          onOpen(item.port);
        }
      }}
      role={item.port ? "button" : undefined}
      tabIndex={item.port ? 0 : undefined}
    >
      <div className="best-times-card__top">
        <div>
          <h3>{item.portName}</h3>
          <p>{item.subtitle}</p>
        </div>
        {item.trendPill ? (
          <span className={`traffic-pill traffic-pill--${item.trendPill.tone}`}>{item.trendPill.label}</span>
        ) : null}
      </div>

      <div className="best-times-card__lane">
        <span>{item.travelLabel}</span>
        <strong>{item.laneLabel}</strong>
      </div>

      <div className="best-times-card__hours">
        {item.bestHours.slice(0, 3).map((entry) => (
          <span key={`${item.key}:${entry.hour}`} className="best-times-card__hour-pill">
            {formatBestHour(entry.hour)}
          </span>
        ))}
      </div>

      <div className="best-times-card__meta">
        <span>Current {formatAlertWait(item.currentDelayMinutes)}</span>
        <span>Usually {formatAlertWait(item.usualDelayMinutes)}</span>
      </div>
    </article>
  );
}

function TrendLaneCard({ item, onOpen }) {
  return (
    <article
      className="trend-lane-card"
      onClick={() => item.port && onOpen(item.port)}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && item.port) {
          event.preventDefault();
          onOpen(item.port);
        }
      }}
      role={item.port ? "button" : undefined}
      tabIndex={item.port ? 0 : undefined}
    >
      <div className="trend-lane-card__top">
        <div>
          <h4>{item.portName}</h4>
          <p>{item.subtitle}</p>
        </div>
        {item.trendPill ? (
          <span className={`traffic-pill traffic-pill--${item.trendPill.tone}`}>{item.trendPill.label}</span>
        ) : null}
      </div>

      <div className="trend-lane-card__labels">
        <span>{item.travelLabel}</span>
        <span>{item.laneLabel}</span>
      </div>

      <div className="trend-lane-card__metrics">
        <div>
          <span>Current</span>
          <strong>{formatAlertWait(item.currentDelayMinutes)}</strong>
        </div>
        <div>
          <span>Usual</span>
          <strong>{formatAlertWait(item.usualDelayMinutes)}</strong>
        </div>
        <div>
          <span>Delta</span>
          <strong>{Number.isFinite(item.deltaMinutes) ? `${item.deltaMinutes > 0 ? "+" : ""}${Math.round(item.deltaMinutes)} min` : "N/A"}</strong>
        </div>
      </div>
    </article>
  );
}

function TrendsView({
  favoriteIds,
  locationStatus,
  onOpenPort,
  ports,
  rows,
  searchText,
  userLocation,
}) {
  const trendRows = normalizeTrendRows(rows, ports, favoriteIds, searchText, userLocation);
  const bestTimeRows = [...trendRows]
    .filter((item) => item.bestHours.length > 0)
    .sort((left, right) => {
      return compareTrendItems(left, right, userLocation, (nextLeft, nextRight) => {
        const leftBest = nextLeft.bestHours[0]?.averageDelayMinutes ?? Infinity;
        const rightBest = nextRight.bestHours[0]?.averageDelayMinutes ?? Infinity;
        if (leftBest !== rightBest) {
          return leftBest - rightBest;
        }

        return (nextLeft.currentDelayMinutes ?? Infinity) - (nextRight.currentDelayMinutes ?? Infinity);
      });
    })
    .slice(0, 6);

  const fasterRows = trendRows
    .filter((item) => item.trendLabel === "faster_than_usual")
    .sort((left, right) => {
      return compareTrendItems(left, right, userLocation, (nextLeft, nextRight) => (
        (nextLeft.deltaMinutes ?? 0) - (nextRight.deltaMinutes ?? 0)
      ));
    });

  const slowerRows = trendRows
    .filter((item) => item.trendLabel === "slower_than_usual")
    .sort((left, right) => {
      return compareTrendItems(left, right, userLocation, (nextLeft, nextRight) => (
        (nextRight.deltaMinutes ?? 0) - (nextLeft.deltaMinutes ?? 0)
      ));
    });

  const summary = {
    bestTimes: trendRows.filter((item) => item.bestHours.length > 0).length,
    faster: fasterRows.length,
    slower: slowerRows.length,
  };

  return (
    <section className="trends-view">
      <div className="trends-summary-grid">
        <TrendsSummaryCard caption="Actionable windows" label="Best times available" tone="best" value={summary.bestTimes} />
        <TrendsSummaryCard caption="Live comparison" label="Moving faster" tone="faster" value={summary.faster} />
        <TrendsSummaryCard caption="Live comparison" label="Running slower" tone="slower" value={summary.slower} />
      </div>

        <section className="trends-section">
          <div className="trends-section__header">
            <div>
              <h2>Best Times To Cross</h2>
              <p>
                {locationStatus === "ready"
                  ? "Your favorites come first, then the closest crossings with the best low-wait windows."
                  : "Your favorites come first, then the strongest low-wait windows we have right now."}
              </p>
            </div>
          </div>
        {bestTimeRows.length > 0 ? (
          <div className="best-times-grid">
            {bestTimeRows.map((item) => (
              <BestTimesCard key={item.key} item={item} onOpen={onOpenPort} />
            ))}
          </div>
        ) : (
          <div className="trends-empty-state">
            <h3>No best-time guidance yet</h3>
            <p>Daily guidance has not populated for the current filters yet.</p>
          </div>
        )}
      </section>

      <div className="trends-columns">
        <section className="trends-section">
          <div className="trends-section__header">
            <div>
              <h2>Moving Faster</h2>
              <p>Lanes currently beating their usual wait.</p>
            </div>
          </div>
          {fasterRows.length > 0 ? (
            <div className="trend-lane-list">
              {fasterRows.slice(0, 8).map((item) => (
                <TrendLaneCard key={item.key} item={item} onOpen={onOpenPort} />
              ))}
            </div>
          ) : (
            <div className="trends-empty-state trends-empty-state--compact">
              <p>No faster-than-usual lanes match right now.</p>
            </div>
          )}
        </section>

        <section className="trends-section">
          <div className="trends-section__header">
            <div>
              <h2>Running Slower</h2>
              <p>Lanes currently above their usual wait.</p>
            </div>
          </div>
          {slowerRows.length > 0 ? (
            <div className="trend-lane-list">
              {slowerRows.slice(0, 8).map((item) => (
                <TrendLaneCard key={item.key} item={item} onOpen={onOpenPort} />
              ))}
            </div>
          ) : (
            <div className="trends-empty-state trends-empty-state--compact">
              <p>No slower-than-usual lanes match right now.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function PortDetailModal({
  alertDrafts,
  alertStatus,
  alertsBusyKey,
  alertsLoading,
  currentPortAlerts,
  onChangeAlertDraft,
  onClose,
  onDeleteAlert,
  onEnableNotifications,
  onSaveAlert,
  port,
  pushState,
}) {
  const visibleTravelGroups = port ? getVisibleTravelGroups(port) : [];
  const [selectedTravelMode, setSelectedTravelMode] = useState("");
  const [selectedLaneType, setSelectedLaneType] = useState("");

  useEffect(() => {
    if (!port || visibleTravelGroups.length === 0) {
      setSelectedTravelMode("");
      setSelectedLaneType("");
      return;
    }

    const matchingTravelGroup = visibleTravelGroups.find((group) => group.travelMode === selectedTravelMode);
    const nextTravelGroup = matchingTravelGroup || visibleTravelGroups[0];
    const hasSelectedLane = nextTravelGroup.entries.some((entry) => entry.id === selectedLaneType);
    const nextLaneEntry = hasSelectedLane
      ? nextTravelGroup.entries.find((entry) => entry.id === selectedLaneType)
      : nextTravelGroup.entries[0];

    if (nextTravelGroup.travelMode !== selectedTravelMode) {
      setSelectedTravelMode(nextTravelGroup.travelMode);
    }

    if (nextLaneEntry && nextLaneEntry.id !== selectedLaneType) {
      setSelectedLaneType(nextLaneEntry.id);
    }
  }, [port, selectedLaneType, selectedTravelMode, visibleTravelGroups]);

  if (!port) {
    return null;
  }

  const selectedTravelGroup = visibleTravelGroups.find((group) => group.travelMode === selectedTravelMode) || visibleTravelGroups[0] || null;
  const selectedLaneEntry = selectedTravelGroup?.entries.find((entry) => entry.id === selectedLaneType) || selectedTravelGroup?.entries[0] || null;
  const draftKey = selectedLaneEntry ? getAlertDraftKey(selectedTravelGroup.travelMode, selectedLaneEntry.id) : "";
  const activeAlerts = selectedLaneEntry
    ? currentPortAlerts.filter((alert) =>
        alert.travel_mode === selectedTravelGroup.travelMode && alert.lane_type === selectedLaneEntry.id,
      )
    : [];
  const thresholdPresets = [5, 10, 15, 20, 30, 45, 60];
  const showEnableNotifications = Boolean(
    pushState.supported !== false && pushState.configured !== false && !pushState.registered,
  );
  const showUnsupportedNotifications = pushState.supported === false || pushState.configured === false;

  return (
    <div className="port-modal-backdrop" onClick={onClose} role="presentation">
      <section
        aria-label={`${port.name} details`}
        className="port-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="port-modal__header">
          <div>
            <h2>{port.name}</h2>
            <p>{port.subtitle || "Mexico Border crossing"}</p>
          </div>
          <button className="port-modal__close" onClick={onClose} type="button" aria-label="Close details">
            ×
          </button>
        </div>

        {visibleTravelGroups.length > 0 ? (
          <>
            <div className="port-modal__travel-tabs" role="tablist" aria-label="Travel mode">
              {visibleTravelGroups.map((group) => (
                <button
                  key={group.travelMode}
                  className={`port-modal__travel-tab ${selectedTravelGroup?.travelMode === group.travelMode ? "is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={selectedTravelGroup?.travelMode === group.travelMode}
                  onClick={() => {
                    setSelectedTravelMode(group.travelMode);
                    setSelectedLaneType(group.entries[0]?.id || "");
                  }}
                >
                  <TravelModeIcon travelMode={group.travelMode} />
                  <span>{group.title}</span>
                </button>
              ))}
            </div>

            <div className="port-modal__lane-strip">
              <div className="port-modal__section-label">Available lanes</div>
              <div className="port-modal__lane-list" role="list">
                {selectedTravelGroup?.entries.map((entry) => {
                  const isActive = selectedLaneEntry?.id === entry.id;
                  const waitTone = getWaitTone(entry.lane?.delayMinutes);
                  const isNoDelay = entry.lane?.delayMinutes === 0;

                  return (
                    <button
                      key={entry.id}
                      className={`port-modal__lane-pill ${isActive ? "is-active" : ""}`}
                      type="button"
                      onClick={() => setSelectedLaneType(entry.id)}
                    >
                      <span className="port-modal__lane-pill-label">{entry.label}</span>
                      <span className={`port-modal__lane-pill-wait port-modal__lane-pill-wait--${waitTone} ${isNoDelay ? "is-no-delay" : ""}`}>
                        {formatAlertWait(entry.lane?.delayMinutes)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        <section className="port-modal__alerts">
          <div className="port-modal__alerts-header">
            <div>
              <h3>{ALERT_TEXT.sectionTitle}</h3>
              <p>{ALERT_TEXT.sectionSubtitle}</p>
            </div>
            {showEnableNotifications ? (
              <button className="port-modal__push-button" type="button" onClick={onEnableNotifications}>
                {pushState.enabling ? ALERT_TEXT.pushEnabling : ALERT_TEXT.enableNotifications}
              </button>
            ) : null}
          </div>

          {showEnableNotifications ? (
            <div className="port-modal__push-banner">
              <strong>{ALERT_TEXT.enableNotifications}</strong>
              <span>{ALERT_TEXT.enableNotificationsPrompt}</span>
            </div>
          ) : null}

          {showUnsupportedNotifications ? (
            <div className="port-modal__push-banner port-modal__push-banner--muted">
              <strong>Notifications unavailable</strong>
              <span>
                {pushState.configured === false ? "Push notifications are not configured." : ALERT_TEXT.unsupported}
              </span>
            </div>
          ) : null}

          {alertStatus?.message ? (
            <p className={`port-modal__alert-status is-${alertStatus.kind || "muted"}`}>{alertStatus.message}</p>
          ) : null}

          {alertsLoading ? (
            <p className="port-modal__alert-status is-muted">{ALERT_TEXT.waiting}</p>
          ) : selectedLaneEntry ? (
            <div className="port-modal__builder">
              <div className="port-modal__builder-summary">
                <p className="port-modal__builder-eyebrow">{selectedTravelGroup?.title}</p>
                <h4>{selectedLaneEntry.label}</h4>
                <div className="port-modal__builder-wait">
                  <span className="port-modal__builder-wait-label">{ALERT_TEXT.currentWait}</span>
                  <span className={`modal-alert-card__wait modal-alert-card__wait--${getWaitTone(selectedLaneEntry.lane?.delayMinutes)}`}>
                    {formatAlertWait(selectedLaneEntry.lane?.delayMinutes)}
                  </span>
                </div>
              </div>

              <div className="port-modal__builder-controls">
                <label className="modal-alert-card__threshold">
                  <span>{ALERT_TEXT.thresholdLabel}</span>
                  <div className="port-modal__threshold-presets">
                    {thresholdPresets.map((preset) => {
                      const currentValue = String(alertDrafts[draftKey] ?? 60);
                      const isActive = currentValue === String(preset);
                      return (
                        <button
                          key={preset}
                          className={`port-modal__threshold-pill ${isActive ? "is-active" : ""}`}
                          type="button"
                          onClick={() => onChangeAlertDraft(selectedTravelGroup.travelMode, selectedLaneEntry.id, preset)}
                        >
                          {preset} min
                        </button>
                      );
                    })}
                  </div>
                  <div className="modal-alert-threshold-wrap">
                    <input
                      type="number"
                      min="0"
                      max="600"
                      step="5"
                      inputMode="numeric"
                      value={alertDrafts[draftKey] ?? 60}
                      onChange={(event) => onChangeAlertDraft(selectedTravelGroup.travelMode, selectedLaneEntry.id, event.target.value)}
                    />
                    <span className="modal-alert-threshold-unit">min</span>
                  </div>
                </label>

                <button
                  className="modal-alert-card__submit"
                  type="button"
                  disabled={alertsBusyKey === draftKey}
                  onClick={() => onSaveAlert(selectedTravelGroup.travelMode, selectedLaneEntry.id, alertDrafts[draftKey] ?? 60)}
                >
                  {alertsBusyKey === draftKey ? "Saving..." : ALERT_TEXT.save}
                </button>
              </div>

              <div className="modal-alert-card__saved">
                {activeAlerts.length > 0 ? (
                  <>
                    <span className="modal-alert-card__saved-label">{ALERT_TEXT.savedLabel}</span>
                    <div className="modal-alert-pill-list">
                      {activeAlerts.map((alert) => (
                        <span key={alert.id} className="modal-alert-pill">
                          <span>{`< ${alert.threshold_minutes} min`}</span>
                          <button
                            className="modal-alert-pill__delete"
                            type="button"
                            onClick={() => onDeleteAlert(alert.id)}
                            aria-label={`Delete ${selectedLaneEntry.label} alert under ${alert.threshold_minutes} minutes`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <span className="modal-alert-card__empty">{ALERT_TEXT.noSaved}</span>
                )}
              </div>
            </div>
          ) : (
            <p className="port-modal__alert-status is-muted">{ALERT_TEXT.empty}</p>
          )}
        </section>

        <div className="port-modal__meta">
          <div>
            <span>Port Status</span>
            <strong>{port.portStatus || "Open"}</strong>
          </div>
          <div>
            <span>Hours</span>
            <strong>{port.hours || "Not listed"}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const portsRef = useRef([]);
  const pushToastTimerRef = useRef(null);
  const [alertDrafts, setAlertDrafts] = useState(() => loadAlertDrafts());
  const [alertStatus, setAlertStatus] = useState(null);
  const [alertsBusyKey, setAlertsBusyKey] = useState("");
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => loadFavoriteIds());
  const [currentView, setCurrentView] = useState("allPorts");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [theme, setTheme] = useState(() => loadTheme());
  const [comparisonRows, setComparisonRows] = useState({});
  const [comparisonRowList, setComparisonRowList] = useState([]);
  const [currentPortAlerts, setCurrentPortAlerts] = useState([]);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [pushState, setPushState] = useState({
    configured: null,
    enabling: false,
    permission: "default",
    registered: false,
    supported: true,
  });
  const [pushToast, setPushToast] = useState({
    body: "",
    link: "/",
    title: "Garita Watch alert",
    visible: false,
  });
  const [selectedPort, setSelectedPort] = useState(null);
  const [status, setStatus] = useState({ message: "Loading live crossings…", tone: "loading" });
  const [ports, setPorts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  function hidePushToast() {
    setPushToast((current) => ({ ...current, visible: false }));
    if (pushToastTimerRef.current) {
      window.clearTimeout(pushToastTimerRef.current);
      pushToastTimerRef.current = null;
    }
  }

  function openPortByNumber(portNumber) {
    if (!portNumber) {
      return;
    }

    const matchingPort = portsRef.current.find((port) => port.portNumber === portNumber);
    if (matchingPort) {
      setSelectedPort(matchingPort);
    }
  }

  useEffect(() => {
    portsRef.current = ports;
  }, [ports]);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Feed request failed (${response.status})`);
        }

        const xmlText = await response.text();
        const parsed = parseFeed(xmlText);

        if (cancelled) return;

        setPorts(parsed.ports);
        setStatus({
          message: "Systems operational",
          tone: "ready",
        });
      } catch (error) {
        if (cancelled) return;

        console.error("Unable to load V2 feed:", error);
        setStatus({
          message: "Unable to load live crossing data",
          tone: "error",
        });
      }
    }

    loadFeed();
    const intervalId = window.setInterval(loadFeed, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (ports.length === 0) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const portNumber = params.get("port");
    if (!portNumber) {
      return;
    }

    openPortByNumber(portNumber);
  }, [ports]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.warn("Unable to store favorites from V2:", error);
    }
  }, [favoriteIds]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.warn("Unable to store V2 theme preference:", error);
    }

    document.documentElement.dataset.v2Theme = theme;
    document.body.dataset.v2Theme = theme;

    return () => {
      delete document.documentElement.dataset.v2Theme;
      delete document.body.dataset.v2Theme;
    };
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    async function loadComparisons() {
      try {
        const rows = await fetchComparisonRows();
        if (cancelled) return;

        const nextMap = (rows || []).reduce((acc, row) => {
          acc[`${row.port_number}:${laneComparisonKey(row.travel_mode, row.lane_type)}`] = row;
          return acc;
        }, {});

        setComparisonRows(nextMap);
        setComparisonRowList(rows || []);
      } catch (error) {
        if (cancelled) return;
        console.warn("Unable to load V2 trend comparisons:", error);
        setComparisonRows({});
        setComparisonRowList([]);
      }
    }

    loadComparisons();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ALERT_DRAFTS_KEY, JSON.stringify(alertDrafts));
    } catch (error) {
      console.warn("Unable to store V2 alert drafts:", error);
    }
  }, [alertDrafts]);

  useEffect(() => {
    let cancelled = false;

    async function loadSupportScripts() {
      try {
        await ensureSupportScriptsLoaded();
        if (!cancelled) {
          void syncPushStatus();
          if (selectedPort) {
            void loadAlertsForPort(selectedPort);
          }
        }
      } catch (error) {
        console.error("Unable to load V2 support scripts:", error);
      }
    }

    void loadSupportScripts();

    return () => {
      cancelled = true;
    };
  }, [selectedPort]);

  useEffect(() => {
    if (currentView !== "trends" || locationStatus !== "idle") {
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    let cancelled = false;
    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) {
          return;
        }

        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("ready");
      },
      () => {
        if (cancelled) {
          return;
        }

        setLocationStatus("unavailable");
      },
      { maximumAge: 60_000, timeout: 5_000 },
    );

    return () => {
      cancelled = true;
    };
  }, [currentView, locationStatus]);

  useEffect(() => {
    const handlePushReady = () => {
      void syncPushStatus();
    };
    const handleSupabaseReady = () => {
      if (selectedPort) {
        void loadAlertsForPort(selectedPort);
      }
    };

    window.addEventListener("garitaWatchPushReady", handlePushReady);
    window.addEventListener("garitaWatchSupabaseReady", handleSupabaseReady);
    void syncPushStatus();

    return () => {
      window.removeEventListener("garitaWatchPushReady", handlePushReady);
      window.removeEventListener("garitaWatchSupabaseReady", handleSupabaseReady);
    };
  }, [selectedPort]);

  useEffect(() => {
    async function showBrowserPushNotification(detail) {
      if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
      }

      const title = detail.title || "Garita Watch alert";
      const body = detail.body || "";
      const link = normalizeV2Link(detail.link || "/", detail.data?.port_number || "");
      const tag = detail.data?.alert_id || "garita-watch-alert";

      if (document.visibilityState === "visible") {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          badge: "/favicon.ico",
          body,
          data: { link },
          icon: "/favicon.ico",
          tag,
        });
        return;
      } catch (error) {
        console.warn("Unable to display V2 service worker notification:", error);
      }

      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          tag,
        });
      } catch (error) {
        console.warn("Unable to display V2 browser notification:", error);
      }
    }

    function handlePushMessage(event) {
      const detail = event.detail || {};
      const title = detail.title || "Garita Watch alert";
      const body = detail.body || "";
      const portNumber = detail.data?.port_number || "";
      const link = normalizeV2Link(detail.link || "/", portNumber);
      const alertId = detail.data?.alert_id || null;

      if (pushToastTimerRef.current) {
        window.clearTimeout(pushToastTimerRef.current);
      }

      if (alertId) {
        setCurrentPortAlerts((current) => current.filter((alert) => alert.id !== alertId));
      }
      if (portNumber) {
        openPortByNumber(portNumber);
      }

      if (document.visibilityState === "visible") {
        setPushToast({
          body,
          link,
          title,
          visible: true,
        });
        pushToastTimerRef.current = window.setTimeout(() => {
          hidePushToast();
        }, 8000);
      } else {
        setPushToast((current) => ({ ...current, visible: false }));
        void showBrowserPushNotification(detail);
      }
    }

    window.addEventListener("garitaWatchPushMessage", handlePushMessage);

    return () => {
      window.removeEventListener("garitaWatchPushMessage", handlePushMessage);
      if (pushToastTimerRef.current) {
        window.clearTimeout(pushToastTimerRef.current);
        pushToastTimerRef.current = null;
      }
    };
  }, []);

  async function syncPushStatus() {
    const pushBridge = getPushBridge();
    if (!pushBridge) {
      setPushState((current) => ({
        ...current,
        configured: false,
        registered: false,
        supported: "Notification" in window,
      }));
      return;
    }

    try {
      const nextState = await pushBridge.syncPushState();
      setPushState((current) => ({
        ...current,
        ...nextState,
        enabling: false,
      }));
    } catch (error) {
      console.warn("Unable to sync V2 push state:", error);
      setPushState((current) => ({
        ...current,
        configured: false,
        enabling: false,
        registered: false,
      }));
    }
  }

  async function loadAlertsForPort(port) {
    const supabaseClient = getSupabaseClient();
    if (!port || !supabaseClient) {
      setCurrentPortAlerts([]);
      return;
    }

    setAlertsLoading(true);

    try {
      const { data, error } = await supabaseClient
        .from("wait_time_alerts")
        .select("id, travel_mode, lane_type, threshold_minutes, created_at")
        .eq("port_number", port.portNumber)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setCurrentPortAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load V2 alerts:", error);
      setCurrentPortAlerts([]);
      setAlertStatus({ kind: "error", message: ALERT_TEXT.waiting });
    } finally {
      setAlertsLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedPort) {
      return;
    }

    setAlertStatus(null);
    setCurrentPortAlerts([]);
    void syncPushStatus();
    void loadAlertsForPort(selectedPort);
  }, [selectedPort]);

  function updateAlertDraft(travelMode, laneType, value) {
    const nextValue = String(value ?? "");
    setAlertDrafts((current) => ({
      ...current,
      [getAlertDraftKey(travelMode, laneType)]: nextValue,
    }));
  }

  async function handleEnableNotifications() {
    const pushBridge = getPushBridge();
    if (!pushBridge || !pushBridge.hasBrowserPushSupport()) {
      setAlertStatus({ kind: "error", message: ALERT_TEXT.unsupported });
      await syncPushStatus();
      return;
    }

    if (!pushBridge.hasConfiguredVapidKey()) {
      setAlertStatus({ kind: "error", message: "Push notifications are not configured." });
      await syncPushStatus();
      return;
    }

    setPushState((current) => ({ ...current, enabling: true }));
    setAlertStatus({ kind: "muted", message: ALERT_TEXT.pushEnabling });

    try {
      await pushBridge.requestAndRegisterPush({ locale: "en" });
      await syncPushStatus();
      setAlertStatus({ kind: "success", message: ALERT_TEXT.pushEnabled });
    } catch (error) {
      console.error("Unable to enable V2 notifications:", error);
      const denied = `${error?.message || ""}`.toLowerCase().includes("blocked");
      setAlertStatus({
        kind: "error",
        message: denied ? ALERT_TEXT.pushDenied : ALERT_TEXT.pushEnableError,
      });
      await syncPushStatus();
    }
  }

  async function ensurePushReadyForAlert() {
    const pushBridge = getPushBridge();
    if (!pushBridge || !pushBridge.hasBrowserPushSupport()) {
      setAlertStatus({ kind: "error", message: ALERT_TEXT.unsupported });
      return false;
    }

    if (!pushBridge.hasConfiguredVapidKey()) {
      setAlertStatus({ kind: "error", message: "Push notifications are not configured." });
      return false;
    }

    if (pushState.registered) {
      return true;
    }

    if (pushState.permission === "denied") {
      setAlertStatus({ kind: "error", message: ALERT_TEXT.pushRequired });
      return false;
    }

    await handleEnableNotifications();
    return Boolean(window.garitaWatchPush && (await window.garitaWatchPush.syncPushState()).registered);
  }

  async function handleSaveAlert(travelMode, laneType, thresholdValue) {
    const supabaseClient = getSupabaseClient();
    const installationId = getInstallationId();
    const port = selectedPort;
    const busyKey = getAlertDraftKey(travelMode, laneType);
    const thresholdMinutes = Number.parseInt(`${thresholdValue || ""}`, 10);

    if (!port || !supabaseClient || !installationId) {
      setAlertStatus({ kind: "error", message: ALERT_TEXT.waiting });
      return;
    }

    if (!Number.isInteger(thresholdMinutes) || thresholdMinutes < 0 || thresholdMinutes > 600) {
      setAlertStatus({ kind: "error", message: ALERT_TEXT.invalidThreshold });
      return;
    }

    const duplicate = currentPortAlerts.some((alert) =>
      alert.travel_mode === travelMode &&
      alert.lane_type === laneType &&
      alert.threshold_minutes === thresholdMinutes,
    );

    if (duplicate) {
      setAlertStatus({ kind: "error", message: ALERT_TEXT.duplicate });
      return;
    }

    setAlertsBusyKey(busyKey);
    setAlertStatus({ kind: "muted", message: ALERT_TEXT.waiting });

    try {
      const pushReady = await ensurePushReadyForAlert();
      if (!pushReady) {
        return;
      }

      const { data, error } = await supabaseClient
        .from("wait_time_alerts")
        .insert({
          crossing_name: port.crossingName || null,
          installation_id: installationId,
          lane_type: laneType,
          operator: "lte",
          port_name: port.name,
          port_number: port.portNumber,
          threshold_minutes: thresholdMinutes,
          travel_mode: travelMode,
        })
        .select("id, travel_mode, lane_type, threshold_minutes, created_at")
        .single();

      if (error) {
        throw error;
      }

      setCurrentPortAlerts((current) => [data, ...current]);
      setAlertStatus({ kind: "success", message: ALERT_TEXT.saveSuccess });
      updateAlertDraft(travelMode, laneType, thresholdMinutes);
    } catch (error) {
      console.error("Unable to save V2 alert:", error);
      setAlertStatus({ kind: "error", message: ALERT_TEXT.saveError });
    } finally {
      setAlertsBusyKey("");
    }
  }

  async function handleDeleteAlert(alertId) {
    const supabaseClient = getSupabaseClient();
    if (!alertId || !supabaseClient) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from("wait_time_alerts")
        .delete()
        .eq("id", alertId);

      if (error) {
        throw error;
      }

      setCurrentPortAlerts((current) => current.filter((alert) => alert.id !== alertId));
      setAlertStatus({ kind: "success", message: "Alert deleted." });
    } catch (error) {
      console.error("Unable to delete V2 alert:", error);
      setAlertStatus({ kind: "error", message: "Could not delete the alert." });
    }
  }

  const filteredPorts = sortPorts(
    ports.filter((port) => {
      const haystack = `${port.name} ${port.subtitle}`.toLowerCase();
      const matchesSearch = haystack.includes(searchText.toLowerCase());
      if (!matchesSearch) return false;

      if (currentView === "favorites") {
        return favoriteIds.includes(port.portNumber);
      }

      return true;
    }),
    "shortest",
  );

  function toggleFavorite(portNumber) {
    setFavoriteIds((current) =>
      current.includes(portNumber)
        ? current.filter((id) => id !== portNumber)
        : [...current, portNumber],
    );
  }

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  function goToAllPortsTop() {
    setCurrentView("allPorts");
    setMobileSearchOpen(false);
    window.scrollTo(0, 0);
  }

  useEffect(() => {
    setMobileSearchOpen(false);
  }, [currentView]);

  const viewTitle = currentView === "favorites"
    ? "My Favorites"
    : currentView === "trends"
      ? "Trends"
      : "All Ports";
  const isFavoritesView = currentView === "favorites";

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand__header">
              <img className="brand__logo" src={garitaWatchMark} alt="" />
              <div className="brand__wordmark">Garita Watch</div>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`sidebar-nav__item ${currentView === item.id ? "is-active" : ""}`}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    setCurrentView(item.id);
                  }
                }}
                type="button"
              >
                <SidebarIcon type={item.id} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div className="workspace-header__surface">
            <div className="workspace-header__main">
              <div className="workspace-header__title">
                <h1>{viewTitle}</h1>
                <div className="workspace-header__mobile-actions">
                  <button
                    className="search-toggle-compact"
                    type="button"
                    onClick={() => setMobileSearchOpen((current) => !current)}
                    aria-label={mobileSearchOpen ? "Hide search" : "Show search"}
                    aria-expanded={mobileSearchOpen}
                    title={mobileSearchOpen ? "Hide search" : "Show search"}
                  >
                    <SearchIcon />
                  </button>
                  <button
                    className="theme-toggle-compact"
                    type="button"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                  >
                    {theme === "light" ? <LightModeIcon /> : <DarkModeIcon />}
                  </button>
                </div>
              </div>
            </div>

            <div className={`workspace-header__actions ${isFavoritesView ? "is-favorites-view" : ""}`}>
              <label className="search-shell" htmlFor="favorite-search">
                <span aria-hidden="true">
                  <SearchIcon />
                </span>
                <input
                  id="favorite-search"
                  type="search"
                  placeholder="Search crossings..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </label>
              <button
                className="theme-toggle"
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                data-theme={theme}
              >
                <span className="theme-toggle__thumb" aria-hidden="true" />
                <span className="theme-toggle__option theme-toggle__option--dark" aria-hidden="true">
                  <DarkModeIcon />
                </span>
                <span className="theme-toggle__option theme-toggle__option--light" aria-hidden="true">
                  <LightModeIcon />
                </span>
              </button>
            </div>
            {mobileSearchOpen ? (
              <label className="search-shell workspace-header__mobile-search" htmlFor="favorite-search-mobile">
                <span aria-hidden="true">
                  <SearchIcon />
                </span>
                <input
                  id="favorite-search-mobile"
                  type="search"
                  placeholder="Search crossings..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </label>
            ) : null}
          </div>
        </header>

        {currentView === "trends" ? (
          <TrendsView
            favoriteIds={favoriteIds}
            locationStatus={locationStatus}
            onOpenPort={setSelectedPort}
            ports={ports}
            rows={comparisonRowList}
            searchText={searchText}
            userLocation={userLocation}
          />
        ) : (
          <section className="favorites-grid">
            {filteredPorts.length > 0 ? (
              <>
                {filteredPorts.map((port) => (
                  <FavoriteCard
                    key={port.portNumber}
                    comparisonRows={comparisonRows}
                    port={port}
                    isFavorite={favoriteIds.includes(port.portNumber)}
                    onOpen={setSelectedPort}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}

                {currentView === "favorites" ? (
                  <article
                    className="favorite-card favorite-card--empty favorite-card--action"
                    onClick={goToAllPortsTop}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        goToAllPortsTop();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="add-crossing">
                      <div className="add-crossing__icon">+</div>
                      <h2>Add New Crossing</h2>
                      <p>Switch to All Ports and star a crossing to keep it here.</p>
                    </div>
                  </article>
                ) : null}
              </>
            ) : (
              <article className="favorite-card favorite-card--empty favorite-card--full">
                <div className="add-crossing">
                  <div className="add-crossing__icon">+</div>
                  <h2>{currentView === "favorites" ? "No Favorites Yet" : "No Active Ports"}</h2>
                  <p>
                    {currentView === "favorites"
                      ? "Star any live crossing from All Ports to pin it here."
                      : "No live passenger crossings matched the current filters."}
                  </p>
                </div>
              </article>
            )}
          </section>
        )}

        <footer className="workspace-footer">
          <div className="workspace-footer__links">
            <span>Garita Watch V2 Exploratory Build</span>
          </div>
        </footer>
      </main>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`mobile-bottom-nav__item ${currentView === item.id ? "is-active" : ""}`}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                setCurrentView(item.id);
              }
            }}
            type="button"
          >
            <SidebarIcon type={item.id} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <PortDetailModal
        alertDrafts={alertDrafts}
        alertStatus={alertStatus}
        alertsBusyKey={alertsBusyKey}
        alertsLoading={alertsLoading}
        currentPortAlerts={currentPortAlerts}
        onChangeAlertDraft={updateAlertDraft}
        onClose={() => setSelectedPort(null)}
        onDeleteAlert={handleDeleteAlert}
        onEnableNotifications={handleEnableNotifications}
        onSaveAlert={handleSaveAlert}
        port={selectedPort}
        pushState={pushState}
      />
      {pushToast.visible ? (
        <div className="push-toast-v2" role="status" aria-live="polite">
          <div className="push-toast-v2__card">
            <div className="push-toast-v2__header">
              <div className="push-toast-v2__icon">
                <ToastAlertIcon />
              </div>
              <div className="push-toast-v2__copy">
                <span className="push-toast-v2__eyebrow">Wait Time Alert</span>
                <p className="push-toast-v2__title">{pushToast.title}</p>
                <p className="push-toast-v2__body">{pushToast.body}</p>
              </div>
            </div>
            <div className="push-toast-v2__actions">
              <a className="push-toast-v2__link" href={pushToast.link || "/"}>
                Open crossing
              </a>
              <button
                className="push-toast-v2__close"
                type="button"
                aria-label="Dismiss notification"
                onClick={hidePushToast}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
