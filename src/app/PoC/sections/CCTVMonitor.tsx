'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface CCTVMonitorProps {
  lang: 'ko' | 'en';
}

type ImageStatus = 'ok' | 'failed' | 'missing';
type EventType = 'person' | 'vehicle' | 'intrusion' | 'none';

type LiveSessionState = 'playing' | 'reconnecting';

interface CameraInfo {
  id: string;
  name: { ko: string; en: string };
}

interface LiveStreamState {
  cameraId: string;
  online: boolean;
  sessionState: LiveSessionState;
  latencyMs: number;
  lastHeartbeat: string;
  streamUrl: string;
}

interface ProcessedArchiveImage {
  id: string;
  cameraId: string;
  batchId: string;
  sequence: number;
  capturedAt: string;
  processedAt: string;
  status: ImageStatus;
  eventType: EventType;
  score?: number;
  processedImageUrl: string;
}

interface ArchiveBatch {
  id: string;
  cameraId: string;
  label: { ko: string; en: string };
  rangeText: string;
  images: ProcessedArchiveImage[];
}

interface BatchTemplate {
  id: string;
  label: { ko: string; en: string };
  startMinute: number;
}

const CAMERAS: CameraInfo[] = [
  { id: 'CT01', name: { ko: '1동 A구역', en: 'House 1 Zone A' } },
  { id: 'CT02', name: { ko: '1동 B구역', en: 'House 1 Zone B' } },
  { id: 'CT03', name: { ko: '2동 A구역', en: 'House 2 Zone A' } },
];

const BATCH_TEMPLATES: BatchTemplate[] = [
  { id: 'latest', label: { ko: '최근 0~6시간', en: 'Latest 0-6h' }, startMinute: 8 * 60 },
  { id: 'prev-1', label: { ko: '이전 6~12시간', en: 'Previous 6-12h' }, startMinute: 2 * 60 },
  { id: 'prev-2', label: { ko: '이전 12~18시간', en: 'Previous 12-18h' }, startMinute: 20 * 60 },
];

const PAGE_SIZE = 12;
const BATCH_FRAME_COUNT = 72;
const SAMPLE_LIVE_VIDEO_URL = '/media/cctv-sample-test1/cctv.mp4';
const SAMPLE_ARCHIVE_IMAGE_URLS = Array.from(
  { length: BATCH_FRAME_COUNT },
  (_, index) => `/media/cctv-sample-test1/images/frame-${String(index + 1).padStart(3, '0')}.jpg`,
);

const t = {
  title: { ko: 'CCTV 모니터링', en: 'CCTV Monitoring' },
  liveFeed: { ko: '라이브 스트림', en: 'Live Stream' },
  archiveTitle: { ko: '보관 분석 이미지', en: 'Archived Processed Images' },
  cameraList: { ko: '카메라 목록', en: 'Camera Rail' },
  streamStatus: { ko: '스트림 상태', en: 'Stream Status' },
  latency: { ko: '지연', en: 'Latency' },
  lastHeartbeat: { ko: '마지막 heartbeat', en: 'Last heartbeat' },
  retry: { ko: '재연결', en: 'Reconnect' },
  retrying: { ko: '재연결 중...', en: 'Reconnecting...' },
  page: { ko: '페이지', en: 'Page' },
  noFrame: { ko: '보관 이미지가 없습니다.', en: 'No archived images.' },
  abnormal: { ko: '이상 프레임', en: 'Abnormal' },
  selectedFrame: { ko: '선택 이미지', en: 'Selected image' },
  confidence: { ko: '신뢰도', en: 'Confidence' },
  online: { ko: '온라인', en: 'Online' },
  offline: { ko: '오프라인', en: 'Offline' },
  alwaysOn: { ko: '상시 라이브 재생', en: 'Always-on playback' },
  separated: { ko: '분석 보관 이미지와 분리된 라이브 채널', en: 'Live channel separated from archived analytics' },
  total72: { ko: '총 72장(6시간)', en: '72 frames (6h)' },
  archiveOnly: { ko: '보관된 가공 이미지 조회 전용', en: 'Archive-only processed image explorer' },
  captureAt: { ko: '캡처 시각', en: 'Captured at' },
  processedAt: { ko: '가공 시각', en: 'Processed at' },
  imageUrl: { ko: '가공 이미지 URL', en: 'Processed image URL' },
  loadingLive: { ko: '라이브 상태 로딩 중...', en: 'Loading live state...' },
  loadingArchive: { ko: '보관 배치 로딩 중...', en: 'Loading archived batches...' },
};

const statusLabel: Record<ImageStatus, { ko: string; en: string }> = {
  ok: { ko: '정상', en: 'OK' },
  failed: { ko: '실패', en: 'Failed' },
  missing: { ko: '누락', en: 'Missing' },
};

const eventLabel: Record<EventType, { ko: string; en: string }> = {
  person: { ko: '사람', en: 'Person' },
  vehicle: { ko: '차량', en: 'Vehicle' },
  intrusion: { ko: '침입', en: 'Intrusion' },
  none: { ko: '이벤트 없음', en: 'No event' },
};

const seededRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
};

const minuteToHHMM = (totalMinute: number) => {
  const normalized = ((totalMinute % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const getFrameColor = (frame: Pick<ProcessedArchiveImage, 'status' | 'eventType'>): string => {
  if (frame.status === 'failed') return '#f85149';
  if (frame.status === 'missing') return '#8b949e';
  if (frame.eventType === 'intrusion') return '#ff7700';
  if (frame.eventType === 'vehicle') return '#58a6ff';
  if (frame.eventType === 'person') return '#3fb950';
  return '#484f58';
};

const getStatusColor = (ok: number, total: number): string => {
  if (total === 0) return '#8b949e';
  const ratio = ok / total;
  if (ratio >= 0.95) return '#3fb950';
  if (ratio >= 0.8) return '#ff7700';
  return '#f85149';
};

const buildArchiveImages = (cameraId: string, batch: BatchTemplate, seedOffset: number): ProcessedArchiveImage[] => {
  const seedMap: Record<string, number> = { CT01: 42, CT02: 137, CT03: 256 };
  const rand = seededRandom((seedMap[cameraId] ?? 1) + seedOffset);

  return Array.from({ length: BATCH_FRAME_COUNT }, (_, i) => {
    const capturedAt = minuteToHHMM(batch.startMinute + i * 5);
    const processedAt = minuteToHHMM(batch.startMinute + i * 5 + 2);

    const statusRoll = rand();
    let status: ImageStatus = 'ok';
    if (statusRoll < 0.06) status = 'missing';
    else if (statusRoll < 0.16) status = 'failed';

    const eventRoll = rand();
    let eventType: EventType = 'none';
    if (status !== 'ok') {
      eventType = 'intrusion';
    } else if (eventRoll < 0.07) {
      eventType = 'person';
    } else if (eventRoll < 0.11) {
      eventType = 'vehicle';
    } else if (eventRoll < 0.13) {
      eventType = 'intrusion';
    }

    const score = eventType === 'none' ? undefined : Math.round((0.65 + rand() * 0.3) * 100) / 100;

    return {
      id: `${cameraId}-${batch.id}-${String(i).padStart(3, '0')}`,
      cameraId,
      batchId: batch.id,
      sequence: i,
      capturedAt,
      processedAt,
      status,
      eventType,
      score,
      processedImageUrl: SAMPLE_ARCHIVE_IMAGE_URLS[i % SAMPLE_ARCHIVE_IMAGE_URLS.length],
    };
  });
};

const buildArchiveBatches = (cameraId: string): ArchiveBatch[] => {
  return BATCH_TEMPLATES.map((batch, idx) => {
    const images = buildArchiveImages(cameraId, batch, idx * 1000);
    return {
      id: `${cameraId}-${batch.id}`,
      cameraId,
      label: batch.label,
      rangeText: `${images[0]?.capturedAt ?? '--:--'} ~ ${images[images.length - 1]?.capturedAt ?? '--:--'}`,
      images,
    };
  });
};

const mockArchiveBatchesMap: Record<string, ArchiveBatch[]> = {
  CT01: buildArchiveBatches('CT01'),
  CT02: buildArchiveBatches('CT02'),
  CT03: buildArchiveBatches('CT03'),
};

const mockLiveStateMap: Record<string, LiveStreamState> = {
  CT01: {
    cameraId: 'CT01',
    online: true,
    sessionState: 'playing',
    latencyMs: 380,
    lastHeartbeat: '13:55',
    streamUrl: 'webrtc://stream.paiptree.local/ct01/live',
  },
  CT02: {
    cameraId: 'CT02',
    online: false,
    sessionState: 'reconnecting',
    latencyMs: 0,
    lastHeartbeat: '13:47',
    streamUrl: 'webrtc://stream.paiptree.local/ct02/live',
  },
  CT03: {
    cameraId: 'CT03',
    online: true,
    sessionState: 'playing',
    latencyMs: 520,
    lastHeartbeat: '13:55',
    streamUrl: 'webrtc://stream.paiptree.local/ct03/live',
  },
};

const wait = (ms: number) => new Promise<void>((resolve) => {
  window.setTimeout(resolve, ms);
});

const fetchLiveStreamState = async (cameraId: string): Promise<LiveStreamState> => {
  await wait(120);
  return mockLiveStateMap[cameraId];
};

const fetchArchiveBatches = async (cameraId: string): Promise<ArchiveBatch[]> => {
  await wait(140);
  return mockArchiveBatchesMap[cameraId] ?? [];
};

const getStatusCounts = (images: ProcessedArchiveImage[]) => {
  const ok = images.filter((img) => img.status === 'ok').length;
  const failed = images.filter((img) => img.status === 'failed').length;
  const missing = images.filter((img) => img.status === 'missing').length;
  return {
    total: images.length,
    ok,
    failed,
    missing,
    abnormal: failed + missing,
  };
};

const CCTVMonitor = ({ lang }: CCTVMonitorProps) => {
  const [activeCamera, setActiveCamera] = useState<string>('CT01');
  const [activeBatchId, setActiveBatchId] = useState<string>('CT01-latest');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [retrying, setRetrying] = useState(false);

  const [liveState, setLiveState] = useState<LiveStreamState | null>(null);
  const [archiveBatches, setArchiveBatches] = useState<ArchiveBatch[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [loadingArchive, setLoadingArchive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingLive(true);
    void fetchLiveStreamState(activeCamera)
      .then((result) => {
        if (!cancelled) {
          setLiveState(result);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingLive(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCamera]);

  useEffect(() => {
    let cancelled = false;
    setLoadingArchive(true);
    void fetchArchiveBatches(activeCamera)
      .then((result) => {
        if (!cancelled) {
          setArchiveBatches(result);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingArchive(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCamera]);

  useEffect(() => {
    setActiveBatchId(`${activeCamera}-latest`);
  }, [activeCamera]);

  const activeBatch = useMemo(
    () => archiveBatches.find((batch) => batch.id === activeBatchId) ?? archiveBatches[0] ?? null,
    [activeBatchId, archiveBatches],
  );

  const images = useMemo(() => activeBatch?.images ?? [], [activeBatch]);
  const counts = useMemo(() => getStatusCounts(images), [images]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(images.length / PAGE_SIZE)), [images.length]);

  useEffect(() => {
    setCurrentPage(Math.max(totalPages - 1, 0));
  }, [activeBatchId, totalPages]);

  useEffect(() => {
    if (images.length === 0) {
      setSelectedImageId(null);
      return;
    }

    const pageStart = currentPage * PAGE_SIZE;
    const pageSlice = images.slice(pageStart, pageStart + PAGE_SIZE);
    if (pageSlice.length === 0) {
      return;
    }

    // Default selection per page: top-right thumbnail (4-column grid => index 3)
    const defaultIdx = Math.min(3, pageSlice.length - 1);
    const defaultId = pageSlice[defaultIdx].id;

    setSelectedImageId((prev) => {
      if (!prev) return defaultId;
      return pageSlice.some((img) => img.id === prev) ? prev : defaultId;
    });
  }, [currentPage, images]);

  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId) ?? null,
    [images, selectedImageId],
  );

  const pageImages = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return images.slice(start, start + PAGE_SIZE);
  }, [currentPage, images]);

  const cameraSummaries = useMemo(() => {
    return CAMERAS.map((camera) => {
      const latestImages = mockArchiveBatchesMap[camera.id]?.[0]?.images ?? [];
      const camCounts = getStatusCounts(latestImages);
      return {
        ...camera,
        counts: camCounts,
        live: mockLiveStateMap[camera.id],
        color: getStatusColor(camCounts.ok, camCounts.total),
      };
    });
  }, []);

  const reconnectStream = () => {
    if (retrying) return;
    setRetrying(true);
    window.setTimeout(() => setRetrying(false), 900);
  };

  return (
    <>
      <style jsx>{`
        .cctv-shell {
          background: #161b22;
          border: 1px solid #30363d;
          width: 100%;
        }
        .cctv-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #30363d;
        }
        .cctv-layout {
          display: flex;
          align-items: stretch;
          gap: 16px;
          padding: 12px 0 0;
        }
        .cctv-left {
          width: 280px;
          display: flex;
          flex-shrink: 0;
        }
        .cctv-center {
          flex: 0 0 auto;
          width: 820px;
          min-width: 0;
        }
        .cctv-right {
          flex: 1;
          min-width: 320px;
          display: flex;
        }
        .panel {
          border: 1px solid #30363d;
          background: #0d1117;
        }
        .camera-rail {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px 8px 10px 4px;
          width: 100%;
          min-height: 100%;
        }
        .camera-list-head {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 6px;
          min-height: 38px;
          padding: 8px;
          font-size: 11px;
          color: #c9d1d9;
          border: 1px solid #30363d;
          background: #11161d;
        }
        .camera-list-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 2px;
          border-top: 1px solid #30363d;
          padding-top: 8px;
        }
        .camera-btn {
          border: 1px solid #30363d;
          background: #11161d;
          padding: 6px;
          text-align: left;
          transition: border-color 0.15s, background 0.15s;
        }
        .camera-btn:hover {
          border-color: #58a6ff;
        }
        .camera-btn.active {
          background: #161b22;
          border-color: #3fb950;
        }
        .camera-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .camera-info {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .camera-subline {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #8b949e;
        }
        .camera-mini-live {
          width: 120px;
          flex-shrink: 0;
          aspect-ratio: 16 / 12;
          border: 1px solid #30363d;
          background: radial-gradient(circle at 20% 20%, #243244 0%, #101823 70%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
        }
        .camera-mini-media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(0.95) contrast(1.05);
        }
        .camera-mini-live.offline {
          background: linear-gradient(135deg, #171b22 0%, #0a0f16 100%);
        }
        .camera-mini-live.offline .camera-mini-media {
          filter: grayscale(1) brightness(0.55);
        }
        .camera-mini-live.active {
          border-color: #3fb950;
          box-shadow: 0 0 0 1px #3fb95044 inset;
        }
        .camera-mini-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 6px;
          pointer-events: none;
        }
        .camera-mini-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .camera-mini-chip {
          border: 1px solid #3fb95066;
          color: #3fb950;
          font-size: 10px;
          line-height: 1;
          padding: 2px 4px;
          background: #3fb9501a;
        }
        .camera-mini-chip.offline {
          border-color: #f8514966;
          color: #f85149;
          background: #f851491a;
        }
        .camera-mini-id {
          color: #c9d1d9;
          font-size: 10px;
          line-height: 1;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        }
        .camera-mini-foot {
          color: #8b949e;
          font-size: 10px;
          line-height: 1;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          text-align: right;
        }
        .live-wrap {
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .ops-bar {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          border-bottom: 1px solid #30363d;
          padding: 10px;
        }
        .ops-item {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #30363d;
          padding: 8px;
          font-size: 11px;
          color: #c9d1d9;
          background: #11161d;
          min-height: 38px;
        }
        .retry-btn {
          border: 1px solid #3fb95055;
          color: #3fb950;
          background: #3fb95011;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.15s;
        }
        .retry-btn:hover {
          background: #3fb95022;
        }
        .retry-btn:disabled {
          opacity: 0.7;
          cursor: default;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .live-frame {
          width: min(calc(100% - 20px), 800px);
          margin: 10px;
          height: auto;
          aspect-ratio: 23 / 18;
          border: 1px solid #30363d;
          background: #0b1017;
          position: relative;
          overflow: hidden;
        }
        .live-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .live-overlay {
          position: absolute;
          left: 10px;
          bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .live-pulse {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #f85149;
          animation: pulse 1.2s ease-out infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        .live-footer {
          border-top: 1px solid #30363d;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
        }
        .stream-url {
          font-size: 10px;
          color: #8b949e;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          border: 1px solid #30363d;
          padding: 2px 6px;
          background: #11161d;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
         .badge {
           font-size: 10px;
           border: 1px solid #30363d;
           padding: 2px 6px;
           background: #11161d;
           color: #c9d1d9;
           display: inline-flex;
           align-items: center;
           gap: 4px;
         }
         .archive-wrap {
           display: flex;
           flex-direction: column;
           min-height: 0;
           height: 100%;
           width: 100%;
           padding: 10px 10px 6px;
           gap: 8px;
         }
         .archive-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           gap: 6px;
           min-height: 38px;
           padding: 8px;
           font-size: 11px;
           color: #c9d1d9;
           border: 1px solid #30363d;
           background: #11161d;
         }
         .archive-content {
           display: flex;
           flex-direction: column;
           gap: 8px;
           border-top: 1px solid #30363d;
           padding-top: 8px;
           flex: 1;
           min-height: 0;
         }
        .archive-note {
          border: 1px solid #30363d;
          background: #11161d;
          color: #8b949e;
          font-size: 11px;
          padding: 8px;
        }
        .preview-pane {
          border: 1px solid #30363d;
          background: #11161d;
          padding: 8px;
          display: flex;
          flex-direction: column;
          border-top: 1px solid #30363d;
          padding-top: 8px;
        }
        .preview-canvas {
          border: 1px solid #30363d;
          aspect-ratio: 16 / 9;
          background: radial-gradient(circle at top, #202a36 0%, #0b1017 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .preview-meta {
          position: absolute;
          top: 6px;
          right: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #c9d1d9;
          font-size: 10px;
          background: rgba(0, 0, 0, 0.7);
          padding: 2px 6px;
          pointer-events: none;
        }
        .batch-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 4px;
        }
         .batch-btn {
           border: 1px solid #30363d;
           background: #11161d;
           color: #8b949e;
           text-align: left;
           padding: 6px 6px;
           display: flex;
           align-items: center;
           justify-content: space-between;
           gap: 4px;
         }
         .batch-btn.active {
           border-color: #58a6ff;
           background: #161b22;
           color: #c9d1d9;
         }
         .paging-row {
           display: flex;
           justify-content: space-between;
           align-items: center;
           gap: 8px;
           font-size: 12px;
           color: #8b949e;
         }
         .page-btn {
           border: 1px solid #30363d;
           background: #11161d;
           color: #c9d1d9;
           padding: 4px 8px;
           display: inline-flex;
           align-items: center;
           justify-content: center;
         }
         .page-btn:disabled {
           opacity: 0.45;
         }
         .thumb-grid {
           display: grid;
           grid-template-columns: repeat(4, minmax(0, 1fr));
           gap: 6px;
         }
         .thumb-btn {
           border: 1px solid #30363d;
           background: #11161d;
           text-align: left;
           padding: 6px;
           transition: border-color 0.15s;
         }
         .thumb-btn:hover {
           border-color: #58a6ff;
         }
         .thumb-btn.selected {
           border-color: #3fb950;
           box-shadow: 0 0 0 1px #3fb95044 inset;
         }
         .thumb-preview {
           border: 1px solid #30363d;
           aspect-ratio: 16 / 9;
           display: flex;
           align-items: center;
           justify-content: center;
           background: #0d1117;
           margin-bottom: 6px;
           overflow: hidden;
           position: relative;
         }
         .thumb-image {
           width: 100%;
           height: 100%;
           object-fit: cover;
           display: block;
         }
         .thumb-meta-row {
           display: flex;
           align-items: center;
           justify-content: space-between;
           gap: 6px;
         }
         .selected-card {
           border: 1px solid #30363d;
           padding: 8px;
           background: #11161d;
         }
         .empty {
           border: 1px dashed #30363d;
           padding: 16px;
           text-align: center;
           color: #8b949e;
           font-size: 12px;
         }
        @media (max-width: 1360px) {
          .thumb-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 1350px) {
          .cctv-layout {
            flex-direction: column;
            gap: 12px;
            padding-top: 12px;
          }
          .cctv-left,
          .cctv-center,
          .cctv-right {
            width: 100%;
            max-width: none;
          }
          .camera-rail {
            padding: 10px;
          }
          .camera-list-scroll {
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 2px;
          }
           .camera-btn {
             min-width: 380px;
           }
          .ops-bar {
            grid-template-columns: 1fr 1fr;
          }
          .live-frame {
            width: calc(100% - 20px);
          }
          .batch-row {
            grid-template-columns: 1fr;
          }
          .preview-pane {
            flex: 0 0 auto;
            min-height: 180px;
          }
          .preview-canvas {
            min-height: 180px;
          }
        }
        @media (max-width: 640px) {
          .live-frame {
            width: calc(100% - 20px);
            margin: 10px;
          }
          .thumb-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
       `}</style>

       <div className="cctv-shell">
         <div className="cctv-header">
           <div className="flex items-center">
             <h3 className="text-gray-300 font-medium">{t.title[lang]}</h3>
           </div>
           <div className="flex items-center gap-2 text-xs">
             <span style={{ color: getStatusColor(counts.ok, counts.total) }}>
               {counts.ok}/{counts.total}
             </span>
             <span className="text-[#f85149]">
               {t.abnormal[lang]} {counts.abnormal}
             </span>
           </div>
         </div>

         <div className="cctv-layout">
          <div className="cctv-left">
            <aside className="panel camera-rail">
              <div className="camera-list-head">{t.cameraList[lang]}</div>
              <div className="camera-list-scroll">
                {cameraSummaries.map((camera) => {
                  const active = camera.id === activeCamera;
                  return (
                    <button
                      key={camera.id}
                      type="button"
                      className={`camera-btn${active ? ' active' : ''}`}
                      onClick={() => setActiveCamera(camera.id)}
                    >
                      <div className="camera-card">
                        <div className="camera-info">
                          <div className="flex items-center">
                            <span className="text-sm font-semibold text-gray-200">{camera.id}</span>
                          </div>
                          <p className="text-[11px] text-gray-500">{camera.name[lang]}</p>
                          <div className="camera-subline">
                            <Clock3 className="w-3 h-3" />
                            <span>{camera.live.online ? `${camera.live.latencyMs}ms` : '--'}</span>
                            <span>·</span>
                            <span>{camera.live.lastHeartbeat}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-[10px]">
                            <span className="badge" style={{ borderColor: camera.color, color: camera.color, flex: 1, justifyContent: 'center' }}>
                              {camera.counts.ok}/{camera.counts.total}
                            </span>
                            <span className="badge" style={{ borderColor: '#f85149', color: '#f85149', flex: 1, justifyContent: 'center' }}>
                              {lang === 'ko' ? '누락' : 'Miss'} {camera.counts.abnormal}
                            </span>
                          </div>
                        </div>
                        <div className={`camera-mini-live${camera.live.online ? '' : ' offline'}${active ? ' active' : ''}`}>
                          {camera.live.online && (
                            <video
                              className="camera-mini-media"
                              src={SAMPLE_LIVE_VIDEO_URL}
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="metadata"
                            />
                          )}
                          <div className="camera-mini-overlay">
                            <div className="camera-mini-head">
                              <span className={`camera-mini-chip${camera.live.online ? '' : ' offline'}`}>
                                {camera.live.online ? 'LIVE' : 'OFF'}
                              </span>
                              <span className="camera-mini-id">{camera.id}</span>
                            </div>
                            <div className="camera-mini-foot">
                              {camera.live.online ? `${camera.live.latencyMs}ms` : 'reconnect'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>

          <div className="cctv-center">
            <section className="panel live-wrap">
             <div className="ops-bar">
               <div className="ops-item">
                 {liveState?.online ? (
                   <Wifi className="w-3.5 h-3.5 text-[#3fb950]" />
                 ) : (
                   <WifiOff className="w-3.5 h-3.5 text-[#f85149]" />
                 )}
                 <span>
                   {t.streamStatus[lang]}: {loadingLive ? t.loadingLive[lang] : liveState?.online ? t.online[lang] : t.offline[lang]}
                 </span>
               </div>
               <div className="ops-item">
                 <Clock3 className="w-3.5 h-3.5 text-[#58a6ff]" />
                 <span>
                   {t.latency[lang]}: {loadingLive ? '-' : liveState?.online ? `${liveState.latencyMs}ms` : '-'}
                 </span>
               </div>
               <div className="ops-item">
                 <Camera className="w-3.5 h-3.5 text-gray-400" />
                 <span>
                   {t.lastHeartbeat[lang]}: {loadingLive ? '--:--' : liveState?.lastHeartbeat ?? '--:--'}
                 </span>
               </div>
               <button type="button" className="retry-btn" onClick={reconnectStream} disabled={retrying}>
                 <RefreshCw className={`w-3.5 h-3.5${retrying ? ' spin' : ''}`} />
                 {retrying ? t.retrying[lang] : t.retry[lang]}
               </button>
             </div>

             <div className="live-frame">
               {liveState?.online && (
                 <video
                   className="live-media"
                   src={SAMPLE_LIVE_VIDEO_URL}
                   autoPlay
                   muted
                   loop
                   playsInline
                   preload="metadata"
                 />
               )}
               <div className="live-overlay">
                 <span className="badge">
                   <span className="live-pulse" />
                   {liveState?.online ? 'LIVE' : 'OFF'}
                 </span>
                 <span className="badge">{activeCamera}</span>
                 <span className="badge">SRC 920x720</span>
               </div>
             </div>

             <div className="live-footer">
               <div>
                 <p className="text-xs text-gray-500">{t.liveFeed[lang]}</p>
                 <p className="text-sm text-gray-300 font-semibold">
                   {CAMERAS.find((camera) => camera.id === activeCamera)?.name[lang]}
                 </p>
               </div>
               <span className="stream-url" title={liveState?.streamUrl ?? ''}>
                 {liveState?.streamUrl ?? 'webrtc://-'}
               </span>
             </div>
            </section>
          </div>

          <div className="cctv-right">
            <section className="panel archive-wrap">
             <div className="archive-header">
               <span>{t.archiveTitle[lang]}</span>
               <span className="text-[#f85149]">{t.abnormal[lang]} {counts.abnormal}</span>
             </div>

             <div className="archive-content">
             {loadingArchive && (
               <div className="text-[11px] text-gray-500">{t.loadingArchive[lang]}</div>
             )}

             <div className="preview-pane">
               <div className="preview-canvas">
                 {selectedImage && selectedImage.status === 'ok' ? (
                   <Image
                     className="preview-image"
                     src={selectedImage.processedImageUrl}
                     alt={`${selectedImage.capturedAt} ${statusLabel[selectedImage.status][lang]}`}
                     fill
                     sizes="(max-width: 1350px) 100vw, 40vw"
                   />
                 ) : !selectedImage ? (
                   <span className="text-xs text-gray-500">{t.noFrame[lang]}</span>
                 ) : null}
                 <div className="preview-meta">
                   <span>{t.selectedFrame[lang]}</span>
                   {selectedImage ? (
                     <span>
                       #{selectedImage.sequence + 1}/{BATCH_FRAME_COUNT}
                     </span>
                   ) : (
                     <span>-</span>
                   )}
                 </div>
               </div>
             </div>

             <div className="batch-row">
               {archiveBatches.map((batch) => {
                 const active = batch.id === activeBatch?.id;
                 return (
                   <button
                     key={batch.id}
                     type="button"
                     className={`batch-btn${active ? ' active' : ''}`}
                     onClick={() => setActiveBatchId(batch.id)}
                   >
                     <span className="text-[11px] font-semibold whitespace-nowrap">{batch.label[lang]}</span>
                     <span className="text-[10px] text-gray-500 whitespace-nowrap">{batch.rangeText}</span>
                   </button>
                 );
               })}
             </div>

             <div className="paging-row">
               <span>
                 {t.page[lang]} {currentPage + 1}/{totalPages} · {images.length}/{BATCH_FRAME_COUNT} · {t.total72[lang]}
               </span>
               <div className="flex items-center gap-1">
                 <button
                   type="button"
                   className="page-btn"
                   onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                   disabled={currentPage <= 0}
                   aria-label="previous page"
                 >
                   <ChevronLeft className="w-3.5 h-3.5" />
                 </button>
                 <button
                   type="button"
                   className="page-btn"
                   onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                   disabled={currentPage >= totalPages - 1}
                   aria-label="next page"
                 >
                   <ChevronRight className="w-3.5 h-3.5" />
                 </button>
               </div>
             </div>

             {pageImages.length > 0 ? (
               <div className="thumb-grid">
                 {pageImages.map((img) => {
                   const isSelected = selectedImageId === img.id;
                   const compactOk = img.status === 'ok';
                   const compactLabel = lang === 'ko' ? (compactOk ? '정상' : '없음') : (compactOk ? 'OK' : 'None');
                   const compactColor = compactOk ? '#3fb950' : '#f85149';
                   return (
                     <button
                       key={img.id}
                       type="button"
                       className={`thumb-btn${isSelected ? ' selected' : ''}`}
                       onClick={() => setSelectedImageId(img.id)}
                       aria-label={`${img.capturedAt} ${statusLabel[img.status][lang]} ${eventLabel[img.eventType][lang]}`}
                     >
                       <div className="thumb-preview">
                         {compactOk ? (
                           <Image
                             className="thumb-image"
                             src={img.processedImageUrl}
                             alt={`${img.capturedAt} thumbnail`}
                             fill
                             sizes="(max-width: 640px) 50vw, (max-width: 1360px) 33vw, 20vw"
                           />
                         ) : null}
                       </div>
                       <div className="thumb-meta-row">
                         <span className="text-[11px] text-gray-300 font-mono">{img.capturedAt}</span>
                         <span className="badge" style={{ color: compactColor, borderColor: compactColor }}>
                           {compactLabel}
                         </span>
                       </div>
                     </button>
                   );
                 })}
               </div>
             ) : (
               <div className="empty">{t.noFrame[lang]}</div>
             )}
             </div>

            </section>
          </div>
        </div>
      </div>
     </>
   );
};

export default CCTVMonitor;
