"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { buildMockAtms } from "./geocodeAtms";

import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: marker2x.src || marker2x,
    iconUrl: marker.src || marker,
    shadowUrl: shadow.src || shadow,
});

const ATMS = buildMockAtms(45);

function MapView({ atms, center, onMap }: { atms: any[], center: [number, number], onMap: (map: L.Map) => void }) {
    return (
        <MapContainer
            center={center}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            ref={onMap}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {atms.map((a) => (
                <Marker key={a.id} position={[a.lat, a.lng]}>
                    <Popup>
                        <div className="min-w-[220px]">
                            <div className="font-extrabold">{a.title}</div>
                            <div className="mt-1.5">{a.address}</div>
                            {a.workTime && (
                                <div className="mt-2 opacity-80 text-sm">
                                    Время: {a.workTime}
                                </div>
                            )}
                            {a.services && (
                                <div className="mt-2.5 text-sm">
                                    <div>CashOut: ✅</div>
                                    <div>CashIn: {a.services.cashIn ? "✅" : "❌"}</div>
                                    <div>Валюта: {a.services.currency?.join(", ")}</div>
                                    <div className="mt-1.5">
                                        Статус:{" "}
                                        <b className={a.status === "active" ? "text-green-600" : "text-red-600"}>
                                            {a.status}
                                        </b>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export const AtmMap = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    const normalWrapRef = useRef<HTMLDivElement>(null);
    const normalMapRef = useRef<L.Map | null>(null);
    const fullMapRef = useRef<L.Map | null>(null);

    const center = useMemo<[number, number]>(() => [38.5598, 68.787], []);

    useEffect(() => {
        setMounted(true);
    }, []);

    const invalidateUntilStable = (map: L.Map | null, el: HTMLElement | null, attempts = 45) => {
        if (!map || !el) return;

        let lastW = -1;
        let lastH = -1;
        let stableCount = 0;

        const step = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;

            if (w === 0 || h === 0) {
                if (attempts-- > 0) requestAnimationFrame(step);
                return;
            }

            if (w === lastW && h === lastH) stableCount += 1;
            else stableCount = 0;

            lastW = w;
            lastH = h;

            map.invalidateSize(true);

            if (stableCount >= 3) return;

            if (attempts-- > 0) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isFullscreen]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        if (isFullscreen) document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev || "";
        };
    }, [isFullscreen]);

    useEffect(() => {
        if (isFullscreen) return;
        if (isCollapsed) return;

        const map = normalMapRef.current;
        const el = normalWrapRef.current;
        if (!map || !el) return;

        invalidateUntilStable(map, el);
    }, [isCollapsed, isFullscreen]);

    if (!mounted) return null;

    return (
        <div className="p-3 bg-card rounded-lg border shadow-sm">
            <div className={`flex justify-end gap-2 mb-3 ${isFullscreen ? "fixed top-5 right-5 z-[10000] mb-0" : "relative"}`}>
                {!isFullscreen && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setIsCollapsed((v) => {
                                const next = !v;
                                if (next) setIsFullscreen(false);
                                return next;
                            });
                        }}
                    >
                        {isCollapsed ? "Показать карту" : "Скрыть карту"}
                    </Button>
                )}

                {!isCollapsed && !isFullscreen && (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsFullscreen(true)}
                    >
                        <Maximize2 className="mr-2 h-4 w-4" /> На весь экран
                    </Button>
                )}
            </div>

            {!isFullscreen && (
                <div 
                    ref={normalWrapRef} 
                    className={`relative w-full rounded-xl overflow-hidden border bg-background transition-all duration-300 ${isCollapsed ? "h-14" : "h-[40vh]"}`}
                >
                    {isCollapsed ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground font-medium">
                            Карта скрыта
                        </div>
                    ) : (
                        <MapView
                            atms={ATMS}
                            center={center}
                            onMap={(map) => {
                                normalMapRef.current = map;
                                invalidateUntilStable(map, normalWrapRef.current);
                            }}
                        />
                    )}
                </div>
            )}

            {isFullscreen &&
                createPortal(
                    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
                        <div className="absolute top-4 right-4 z-[10000]">
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setIsFullscreen(false);
                                    setTimeout(() => {
                                        const map = normalMapRef.current;
                                        const el = normalWrapRef.current;
                                        invalidateUntilStable(map, el);
                                    }, 0);
                                }}
                            >
                                <Minimize2 className="mr-2 h-4 w-4" /> Выйти из полноэкранного режима
                            </Button>
                        </div>

                        <div className="flex-1 w-full h-full">
                            <MapView
                                atms={ATMS}
                                center={center}
                                onMap={(map) => {
                                    fullMapRef.current = map;
                                    requestAnimationFrame(() => map.invalidateSize(true));
                                    setTimeout(() => map.invalidateSize(true), 60);
                                }}
                            />
                        </div>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000] bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm shadow-lg border border-white/10">
                            Нажмите ESC или кнопку выше, чтобы выйти
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}

export default AtmMap;
