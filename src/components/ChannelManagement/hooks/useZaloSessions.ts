// src/hooks/useZaloSessions.ts
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getZaloSessions,
  logoutZalo,
  zaloLoginQRStream,
  QRResponse,
  ZaloSessionInfo,
  getZaloStatus,
} from "../../../services/zaloService";

export function useZaloSessions() {
  const [sessions, setSessions] = useState<ZaloSessionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // QR state
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "waiting" | "connected">("idle");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrMsg, setQrMsg] = useState<string | null>(null);
  const sseActiveRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getZaloSessions();
      setSessions(res.items || []);
    } catch (e: any) {
      setErr(e?.message || "Lỗi tải phiên Zalo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connectViaQR = useCallback(async () => {
    setOpen(true);
    setPhase("waiting");
    setQrImage(null);
    setQrMsg(null);

    if (sseActiveRef.current) return;
    sseActiveRef.current = true;

    await zaloLoginQRStream(
      (data: QRResponse) => {
        if (data?.type === "qr" && data?.data?.image) {
          setQrImage(`data:image/png;base64,${data.data.image}`);
        }
        if (data?.type === "status" && data?.data?.code) {
          setQrMsg(data.data.code);
        }
        if (data?.type === "success") {
          setPhase("connected");
          refresh();
        }
        if (data?.type === "error") {
          setQrMsg(data?.error || "Có lỗi khi kết nối QR");
        }
      },
      (error) => {
        setQrMsg(error.message || "Lỗi stream QR");
        sseActiveRef.current = false;
      },
      () => {
        sseActiveRef.current = false;
      }
    );
  }, [refresh]);

  const closeQR = useCallback(() => {
    setOpen(false);
    setPhase("idle");
    setQrImage(null);
    setQrMsg(null);
  }, []);

  const disconnect = useCallback(
    async (accountId?: string) => {
      await logoutZalo(accountId);
      await refresh();
    },
    [refresh]
  );

  const status = useCallback(async () => {
    try {
      return await getZaloStatus();
    } catch {
      return null;
    }
  }, []);

  return {
    sessions,
    loading,
    err,
    refresh,
    connectViaQR,
    disconnect,
    qr: { open, phase, image: qrImage, msg: qrMsg, close: closeQR },
    status,
  };
}
