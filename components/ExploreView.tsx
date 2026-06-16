'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { addHistory, getHistory } from '@/lib/history';
import type { HistoryRecord } from '@/lib/types';

const BAIDU_AK = 'DPz902rt3QX3pgzD2xZPOr942uMnTeAu';

const statusToPoiType: Record<string, string> = {
  '美滋滋': '公园',
  '元气满满': '运动健身',
  '满血复活': '运动健身',
  '恋爱中': '电影院',
  '感性时刻': '咖啡厅',
  '发呆': '公园',
  '疲惫': '按摩',
  '胡思乱想': '书店',
  'emo中': '酒吧',
  '裂开': '甜品',
  '摸鱼中': '咖啡厅',
  '通勤中': '便利店',
  '搬砖中': '咖啡厅',
  '开会循环': '咖啡厅',
  '出差': '景点',
  '沉迷学习': '图书馆',
  '灵感爆发': '展览馆',
  'deadline战士': '咖啡厅',
  '干饭': '美食',
  '喝奶茶': '奶茶',
  '喝咖啡': '咖啡厅',
  '自拍': '网红打卡',
  '聚会': '餐厅',
  '微醺': '酒吧',
  'city walk': '景点',
  '旅途中': '景点',
  '运动': '运动健身',
  '宅家': '外卖',
  '睡觉': '酒店',
  '刷手机': '咖啡厅',
  '追剧': '电影院',
  '玩游戏': '网吧',
  '听歌': 'livehouse',
  '看书': '书店',
  '吸猫': '猫咖',
  '遛狗': '公园',
};

interface PoiItem {
  name: string;
  address: string;
  distance?: string;
  distanceNum: number;
  marker?: any;
  photo?: string | null;
  lat: number;
  lng: number;
}

const MAP_CENTER_KEY = 'moodvibe-map-center';

declare global {
  interface Window {
    BMapGL: any;
    initBaiduMap: () => void;
  }
}

const NORMAL_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24"><defs><filter id="s" x="-20%" y="-10%" width="140%" height="130%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity="0.2"/></filter></defs><path d="M9 1C4.6 1 1 4.6 1 9c0 6.5 8 13.5 8 13.5s8-7 8-13.5c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" fill="white" stroke="#000" stroke-width="0.5" filter="url(#s)"/></svg>';
const ACTIVE_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 22 30"><defs><filter id="s" x="-20%" y="-10%" width="140%" height="130%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.3"/></filter></defs><path d="M11 1C5.5 1 1 5.5 1 11c0 8 10 17 10 17s10-9 10-17c0-5.5-4.5-10-10-10zm0 13.5c-2 0-3.5-1.5-3.5-3.5s1.5-3.5 3.5-3.5 3.5 1.5 3.5 3.5-1.5 3.5-3.5 3.5z" fill="#333" stroke="#000" stroke-width="0.5" filter="url(#s)"/></svg>';

const POI_CACHE_KEY = 'moodvibe-explore-pois';

interface PoiCache {
  keyword: string;
  pois: PoiItem[];
  label: string;
}

function loadPoiCache(): PoiCache | null {
  try {
    const raw = localStorage.getItem(POI_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function savePoiCache(keyword: string, pois: PoiItem[], label: string) {
  const serializable = pois.map(({ marker, ...rest }) => rest);
  localStorage.setItem(POI_CACHE_KEY, JSON.stringify({ keyword, pois: serializable, label }));
}

export default function ExploreView() {
  const pathname = usePathname();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [pois, setPois] = useState<PoiItem[]>([]);
  const [poiLoading, setPoiLoading] = useState(false);
  const [searchLabel, setSearchLabel] = useState('');
  const [activePoi, setActivePoi] = useState<number>(-1);
  const [highlightPoi, setHighlightPoi] = useState<PoiItem | null>(null);
  const highlightMarkerRef = useRef<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const hasSearched = useRef(false);

  useEffect(() => {
    if (window.BMapGL) {
      setMapLoaded(true);
      return;
    }

    window.initBaiduMap = () => {
      setMapLoaded(true);
    };

    const script = document.createElement('script');
    script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${BAIDU_AK}&callback=initBaiduMap`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstance.current) return;

    const map = new window.BMapGL.Map(mapRef.current);

    // 用缓存的地图中心点快速初始化（避免白屏）
    let savedCenter: { lng: number; lat: number } | null = null;
    try {
      const raw = localStorage.getItem(MAP_CENTER_KEY);
      if (raw) savedCenter = JSON.parse(raw);
    } catch {}

    if (savedCenter) {
      map.centerAndZoom(new window.BMapGL.Point(savedCenter.lng, savedCenter.lat), 14);
    } else {
      const cityName = localStorage.getItem('moodvibe-city');
      if (cityName) {
        map.centerAndZoom(cityName, 14);
      } else {
        map.centerAndZoom(new window.BMapGL.Point(116.404, 39.915), 14);
      }
    }

    map.enableScrollWheelZoom(true);
    map.addEventListener('tilesloaded', function onLoad() {
      map.setMapStyleV2({ styleId: 'b93e38a5f238f081d43963eb372693af' });
      map.removeEventListener('tilesloaded', onLoad);
    });

    mapInstance.current = map;

    // 首次进入 APP 时自动定位
    relocate();
  }, [mapLoaded]);

  // 离开探索页时清除高亮
  useEffect(() => {
    if (pathname !== '/explore') {
      dismissHighlight();
    }
  }, [pathname]);

  const locationMarkerRef = useRef<any>(null);

  const [locating, setLocating] = useState(false);

  function relocate() {
    const map = mapInstance.current;
    if (!map || !window.BMapGL) return;
    setLocating(true);

    // 使用浏览器原生 Geolocation API 获取精确位置
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // 浏览器返回的是 WGS84 坐标，需要转换为百度坐标
          const convertor = new window.BMapGL.Convertor();
          const pointArr = [new window.BMapGL.Point(longitude, latitude)];
          convertor.translate(pointArr, 1, 5, (data: any) => {
            if (data.status === 0 && data.points?.length > 0) {
              const pt = data.points[0];
              map.centerAndZoom(pt, 15);
              localStorage.setItem(MAP_CENTER_KEY, JSON.stringify({ lng: pt.lng, lat: pt.lat }));

              if (locationMarkerRef.current) {
                map.removeOverlay(locationMarkerRef.current);
              }
              const locationIcon = new window.BMapGL.Icon(
                `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#6BB5A0" fill-opacity="0.2" stroke="#6BB5A0" stroke-width="1.5"/><circle cx="10" cy="10" r="4" fill="#6BB5A0"/></svg>')}`,
                new window.BMapGL.Size(20, 20)
              );
              const marker = new window.BMapGL.Marker(pt, { icon: locationIcon });
              map.addOverlay(marker);
              locationMarkerRef.current = marker;

              const keyword = getSearchKeywordOnly();
              if (keyword) {
                searchNearby(map, pt);
              } else {
                setPois([]);
                setPoiLoading(false);
              }
            }
            setLocating(false);
          });
        },
        () => {
          // 浏览器定位失败，回退到百度 SDK 定位
          fallbackBaiduLocate(map);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      fallbackBaiduLocate(map);
    }
  }

  function fallbackBaiduLocate(map: any) {
    const geolocation = new window.BMapGL.Geolocation();
    geolocation.enableSDKLocation();
    geolocation.getCurrentPosition(function (r: any) {
      if (r && r.point) {
        map.centerAndZoom(r.point, 15);
        localStorage.setItem(MAP_CENTER_KEY, JSON.stringify({ lng: r.point.lng, lat: r.point.lat }));

        if (locationMarkerRef.current) {
          map.removeOverlay(locationMarkerRef.current);
        }
        const locationIcon = new window.BMapGL.Icon(
          `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#6BB5A0" fill-opacity="0.2" stroke="#6BB5A0" stroke-width="1.5"/><circle cx="10" cy="10" r="4" fill="#6BB5A0"/></svg>')}`,
          new window.BMapGL.Size(20, 20)
        );
        const marker = new window.BMapGL.Marker(r.point, { icon: locationIcon });
        map.addOverlay(marker);
        locationMarkerRef.current = marker;

        const keyword = getSearchKeywordOnly();
        if (keyword) {
          searchNearby(map, r.point);
        } else {
          setPois([]);
          setPoiLoading(false);
        }
      }
      setLocating(false);
    });
  }

  function dismissHighlight() {
    if (highlightMarkerRef.current && mapInstance.current) {
      mapInstance.current.removeOverlay(highlightMarkerRef.current);
      highlightMarkerRef.current = null;
    }
    setHighlightPoi(null);
  }

  // 从记录页跳转过来时高亮对应地点或定位到坐标
  useEffect(() => {
    if (pathname !== '/explore') return;
    const highlightName = sessionStorage.getItem('moodvibe-highlight-place');
    if (!highlightName) return;

    const locationRaw = sessionStorage.getItem('moodvibe-highlight-place-location');
    const addressRaw = sessionStorage.getItem('moodvibe-highlight-place-address') || '';
    const photoRaw = sessionStorage.getItem('moodvibe-highlight-place-photo') || null;
    const map = mapInstance.current;
    if (!map) return;

    sessionStorage.removeItem('moodvibe-highlight-place');
    sessionStorage.removeItem('moodvibe-highlight-place-location');
    sessionStorage.removeItem('moodvibe-highlight-place-address');
    sessionStorage.removeItem('moodvibe-highlight-place-photo');

    const index = pois.findIndex(p => p.name === highlightName);
    if (index >= 0) {
      handleSelectPoi(index);
    } else if (locationRaw) {
      try {
        const { lat, lng } = JSON.parse(locationRaw);
        const point = new window.BMapGL.Point(lng, lat);
        map.centerAndZoom(point, 16);
        const marker = new window.BMapGL.Marker(point, {
          icon: new window.BMapGL.Icon(
            `data:image/svg+xml,${encodeURIComponent(ACTIVE_ICON_SVG)}`,
            new window.BMapGL.Size(22, 30)
          ),
        });
        map.addOverlay(marker);
        highlightMarkerRef.current = marker;
        setHighlightPoi({ name: highlightName, address: addressRaw, distanceNum: 0, photo: photoRaw, lat, lng });
      } catch {}
    } else {
      const local = new window.BMapGL.LocalSearch(map, {
        pageCapacity: 1,
        onSearchComplete: (results: any) => {
          if (results && results.getCurrentNumPois() > 0) {
            const poi = results.getPoi(0);
            if (poi) {
              map.centerAndZoom(poi.point, 16);
              const marker = new window.BMapGL.Marker(poi.point, {
                icon: new window.BMapGL.Icon(
                  `data:image/svg+xml,${encodeURIComponent(ACTIVE_ICON_SVG)}`,
                  new window.BMapGL.Size(22, 30)
                ),
              });
              map.addOverlay(marker);
              highlightMarkerRef.current = marker;
              setHighlightPoi({
                name: highlightName,
                address: poi.address || addressRaw,
                distanceNum: 0,
                photo: photoRaw,
                lat: poi.point.lat,
                lng: poi.point.lng,
              });
            }
          }
        },
      });
      local.search(highlightName);
    }
  }, [pathname, pois, mapLoaded]);

  function getSearchKeywordOnly(): string {
    try {
      const statusRaw = localStorage.getItem('moodvibe-daily-status');
      if (statusRaw) {
        const { statuses } = JSON.parse(statusRaw);
        if (statuses?.length > 0) {
          for (const s of statuses) {
            if (statusToPoiType[s.label]) return statusToPoiType[s.label];
          }
        }
      }
    } catch {}
    return '';
  }

  function getSearchKeyword(): string {
    try {
      const statusRaw = localStorage.getItem('moodvibe-daily-status');
      if (statusRaw) {
        const { statuses } = JSON.parse(statusRaw);
        if (statuses?.length > 0) {
          for (const s of statuses) {
            if (statusToPoiType[s.label]) {
              setSearchLabel(s.label);
              return statusToPoiType[s.label];
            }
          }
        }
      }
    } catch {}
    setSearchLabel('');
    return '';
  }

  function searchNearby(map: any, center: any) {
    const keyword = getSearchKeyword();
    if (!keyword) {
      setPois([]);
      setPoiLoading(false);
      return;
    }
    setPoiLoading(true);
    setActivePoi(-1);

    const local = new window.BMapGL.LocalSearch(map, {
      pageCapacity: 10,
      onSearchComplete: (results: any) => {
        const items: PoiItem[] = [];
        if (results && results.getCurrentNumPois() > 0) {
          for (let i = 0; i < results.getCurrentNumPois(); i++) {
            const poi = results.getPoi(i);
            if (poi) {
              const dist = center ? Math.round(map.getDistance(center, poi.point)) : 0;
              const marker = new window.BMapGL.Marker(poi.point, {
                icon: new window.BMapGL.Icon(
                  `data:image/svg+xml,${encodeURIComponent(NORMAL_ICON_SVG)}`,
                  new window.BMapGL.Size(18, 24)
                ),
              });
              map.addOverlay(marker);
              items.push({
                name: poi.title,
                address: poi.address || '',
                distance: dist >= 1000 ? `${(dist / 1000).toFixed(1)}km` : `${dist}m`,
                distanceNum: dist,
                marker,
                photo: null,
                lat: poi.point.lat,
                lng: poi.point.lng,
              });
            }
          }
        }
        items.sort((a, b) => a.distanceNum - b.distanceNum);
        setPois(items);
        setPoiLoading(false);
        // 获取当前 label 用于缓存
        let cacheLabel = '';
        try {
          const statusRaw = localStorage.getItem('moodvibe-daily-status');
          if (statusRaw) {
            const { statuses } = JSON.parse(statusRaw);
            if (statuses?.length > 0) {
              for (const s of statuses) {
                if (statusToPoiType[s.label]) { cacheLabel = s.label; break; }
              }
            }
          }
        } catch {}
        savePoiCache(keyword, items, cacheLabel);

        // 异步加载图片
        const city = localStorage.getItem('moodvibe-city') || '北京';
        items.forEach((item, idx) => {
          fetch(`/api/place-photo?keyword=${encodeURIComponent(item.name)}&location=${item.lat},${item.lng}&city=${encodeURIComponent(city)}`)
            .then(res => res.json())
            .then(data => {
              if (data.photo) {
                setPois(prev => {
                  const updated = prev.map((p, i) => i === idx ? { ...p, photo: data.photo } : p);
                  savePoiCache(keyword, updated, cacheLabel);
                  return updated;
                });
              }
            })
            .catch(() => {});
        });
      },
    });

    local.searchNearby(keyword, center, 3000);
  }

  function handleSelectPoi(index: number) {
    const map = mapInstance.current;
    if (!map) return;

    // 重置之前高亮的标记
    if (activePoi >= 0 && pois[activePoi]?.marker) {
      pois[activePoi].marker.setIcon(new window.BMapGL.Icon(
        `data:image/svg+xml,${encodeURIComponent(NORMAL_ICON_SVG)}`,
        new window.BMapGL.Size(18, 24)
      ));
    }

    // 再次点击同一个：取消选择
    if (activePoi === index) {
      setActivePoi(-1);
      return;
    }

    // 高亮选中的标记
    if (pois[index]?.marker) {
      pois[index].marker.setIcon(new window.BMapGL.Icon(
        `data:image/svg+xml,${encodeURIComponent(ACTIVE_ICON_SVG)}`,
        new window.BMapGL.Size(22, 30)
      ));
      map.panTo(pois[index].marker.getPosition());
    }

    setActivePoi(index);
  }

  const [addedIds, setAddedIds] = useState<Set<string>>(() => {
    const history = getHistory();
    return new Set(history.filter(r => r.type === 'place').map(r => r.placeName || ''));
  });

  function handleAddPlace(poi: PoiItem) {
    if (addedIds.has(poi.name)) return;
    const id = `place_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let city = '';
    let weather = 'cloudy';
    let temp = 0;
    let statuses: { emoji: string; label: string }[] = [];
    try {
      const cache = localStorage.getItem('moodvibe-weather-cache');
      if (cache) {
        const { data } = JSON.parse(cache);
        city = data.city || '';
        weather = data.weather || 'cloudy';
        temp = data.temp || 0;
      }
      const statusRaw = localStorage.getItem('moodvibe-daily-status');
      if (statusRaw) {
        const { statuses: s } = JSON.parse(statusRaw);
        statuses = (s || []).map((item: { emoji: string; label: string }) => ({ emoji: item.emoji, label: item.label }));
      }
    } catch {}

    const record: HistoryRecord = {
      id,
      type: 'place',
      date: new Date().toISOString(),
      city,
      weather,
      temp,
      statuses,
      song: '',
      artist: '',
      cover: null,
      gradient: { css: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' },
      quote: '',
      url: null,
      lyric: null,
      placeName: poi.name,
      placeAddress: poi.address,
      placePhoto: poi.photo,
      placeLat: poi.lat,
      placeLng: poi.lng,
    };
    addHistory(record);
    setAddedIds(prev => new Set(prev).add(poi.name));
  }

  return (
    <main className="px-5 pt-14 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">探索</h1>

      {/* 地图 */}
      <div className="relative mb-6">
        <div
          ref={mapRef}
          className="w-full h-[240px] rounded-2xl overflow-hidden border border-gray-200"
        >
          {!mapLoaded && (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* 历史地点高亮 */}
      {highlightPoi && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-gray-900">回忆地点</h2>
            <button
              onClick={() => dismissHighlight()}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              收起
            </button>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#2C2C2C] border border-[#2C2C2C] shadow-sm">
            <div className="w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden bg-white/20">
              {highlightPoi.photo ? (
                <img src={highlightPoi.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{highlightPoi.name}</p>
              {highlightPoi.address && (
                <p className="text-xs text-gray-300 truncate mt-1">{highlightPoi.address}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 推荐列表 */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-1">当前区域推荐</h2>
        <p className="text-xs text-gray-400 mb-4">
          {searchLabel ? `根据「${searchLabel}」状态，为你推荐附近去处` : '为你推荐附近热门去处'}
        </p>

        {poiLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 p-3 rounded-2xl bg-white animate-pulse">
                <div className="w-20 h-20 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 py-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-1.5" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : pois.length > 0 ? (
          <div className="space-y-3">
            {pois.map((poi, i) => (
              <button
                key={i}
                onClick={() => handleSelectPoi(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border shadow-sm text-left transition-all ${
                  activePoi === i
                    ? 'bg-[#2C2C2C] border-[#2C2C2C]'
                    : 'bg-white border-gray-100 active:bg-[#FFF8F3]'
                }`}
              >
                <div className={`w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden ${
                  activePoi === i ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {poi.photo ? (
                    <img src={poi.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className={`w-8 h-8 ${activePoi === i ? 'text-white/60' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${activePoi === i ? 'text-white' : 'text-gray-800'}`}>{poi.name}</p>
                  <p className={`text-xs truncate mt-1 ${activePoi === i ? 'text-gray-300' : 'text-gray-400'}`}>{poi.address}</p>
                  {poi.distance && (
                    <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full ${
                      activePoi === i ? 'text-orange-200 bg-white/10' : 'text-[#D4845C] bg-[#FFF0E8]'
                    }`}>
                      {poi.distance}
                    </span>
                  )}
                </div>
                {/* 想去按钮 */}
                <div
                  onClick={(e) => { e.stopPropagation(); handleAddPlace(poi); }}
                  className="flex-shrink-0"
                >
                  {addedIds.has(poi.name) ? (
                    <span className={`text-[10px] px-2.5 py-1 rounded-full ${
                      activePoi === i ? 'text-orange-200 bg-white/10' : 'text-[#D4845C] bg-[#FFF0E8] border border-[#F4A47C]/30'
                    }`}>想去</span>
                  ) : (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      activePoi === i ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-4 h-4 ${activePoi === i ? 'text-white/60' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-xl mb-2 grayscale-[30%]">📍</p>
            <p className="text-sm text-gray-600">{searchLabel ? '暂未找到推荐地点' : '尚未设置状态'}</p>
            <p className="text-xs text-gray-500 mt-1">{searchLabel ? '试试切换状态或位置' : '在首页设置状态后，为你推荐附近去处'}</p>
          </div>
        )}
      </section>
    </main>
  );
}
