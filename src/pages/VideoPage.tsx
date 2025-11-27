import React, { useState, useEffect } from "react";
import {
  Video,
  Edit,
  Film,
  Type,
  Volume2,
  Send,
  RefreshCw,
  Play,
  X,
  Download,
  Image,
  Clock,
  FileText,
  Layers,
  ChevronDown,
  Loader2,
  Podcast,
  Speech,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { useApiKeys } from "../hooks/useApiKeys";
import {
  getApiBaseUrl,
  getVideoApiBaseUrl,
  useVideoProgress,
  VideoProgressDisplay,
  VideoGallery,
} from "../components/VideoCreation/VideoCreationShared";
import { getAuthToken } from "../services/apiService";
import VideoPostModal, {
  SelectedAccount,
  PostContent,
} from "../components/VideoPostModal";
import { PodcastMode } from "../components/VideoCreation/PodcastMode";
import { useAuth } from "../hooks/useAuth";

// Types
interface VideoData {
  id: number;
  title: string;
  duration: string;
  resolution: string;
  format: string;
  size: string;
  date: string;
  description: string;
}

// Constants
const VIDEOS: VideoData[] = [
  {
    id: 1,
    title: "Video Giới Thiệu Sản Phẩm",
    duration: "45 giây",
    resolution: "1920x1080",
    format: "MP4",
    size: "45.2 MB",
    date: "15/10/2023",
    description:
      "Video giới thiệu sản phẩm mới với đầy đủ tính năng và ưu điểm nổi bật.",
  },
  {
    id: 2,
    title: "Hướng Dẫn Sử Dụng",
    duration: "1 phút 30 giây",
    resolution: "1920x1080",
    format: "MP4",
    size: "78.5 MB",
    date: "12/10/2023",
    description:
      "Hướng dẫn chi tiết cách sử dụng sản phẩm từ cơ bản đến nâng cao.",
  },
  {
    id: 3,
    title: "Review Công Nghệ Mới",
    duration: "2 phút 15 giây",
    resolution: "1920x1080",
    format: "MP4",
    size: "112.3 MB",
    date: "10/10/2023",
    description: "Đánh giá chi tiết về công nghệ mới nhất trên thị trường.",
  },
  {
    id: 4,
    title: "Tin Tức Nóng Hôm Nay",
    duration: "1 phút 5 giây",
    resolution: "1080x1920",
    format: "MP4",
    size: "32.7 MB",
    date: "18/10/2023",
    description: "Tổng hợp tin tức nóng nhất trong ngày.",
  },
];

const TABS = [
  { id: "script", label: "Kịch bản", icon: Edit },
  { id: "video", label: "Video", icon: Film },
  { id: "subtitle", label: "Phụ đề", icon: Type },
  { id: "audio", label: "Âm thanh", icon: Volume2 },
];

// Components
const Tab: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 min-w-0 px-3 py-3 font-medium border-b-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm lg:text-base ${
      active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-600 hover:text-gray-900"
    }`}
  >
    <Icon size={16} className="flex-shrink-0" />
    <span className="hidden xs:inline">{label}</span>
  </button>
);


const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step = 1, onChange }) => (
  <div className="mb-4">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
      {label}: <span className="text-blue-600 font-semibold">{value}</span>
    </label>
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <span className="min-w-[45px] text-center font-medium text-gray-700 text-sm">
        {value}
      </span>
    </div>
  </div>
);

const VideoModal: React.FC<{
  show: boolean;
  onClose: () => void;
  video?: VideoData;
}> = ({ show, onClose, video }) => {
  if (!show || !video) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-3xl max-h-[90dvh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
            Chi tiết video
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 md:p-6 max-h-[calc(90dvh-80px)] overflow-y-auto">
          <div className="w-full h-48 md:h-80 bg-gray-900 rounded-lg mb-4 md:mb-6 flex items-center justify-center">
            <Play className="text-white" size={32} />
          </div>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div>
              {[
                ["Tiêu đề", video.title],
                ["Thời lượng", video.duration],
                ["Độ phân giải", video.resolution],
              ].map(([label, value]) => (
                <div key={label} className="mb-3">
                  <div className="text-xs md:text-sm font-semibold text-gray-500 mb-1">
                    {label}
                  </div>
                  <div className="text-sm md:text-base text-gray-900">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div>
              {[
                ["Định dạng", video.format],
                ["Kích thước file", video.size],
                ["Ngày tạo", video.date],
              ].map(([label, value]) => (
                <div key={label} className="mb-3">
                  <div className="text-xs md:text-sm font-semibold text-gray-500 mb-1">
                    {label}
                  </div>
                  <div className="text-sm md:text-base text-gray-900">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4 md:mb-6">
            <div className="text-xs md:text-sm font-semibold text-gray-500 mb-1">
              Mô tả
            </div>
            <div className="text-sm md:text-base text-gray-900">
              {video.description}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm">
              <Download size={16} /> Tải xuống
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm">
              <Send size={16} /> Đăng bài
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileTabSelect: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => (
  <div className="lg:hidden relative mb-4">
    <select
      value={activeTab}
      onChange={(e) => setActiveTab(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
    >
      {TABS.map((tab) => (
        <option key={tab.id} value={tab.id}>
          {tab.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={16}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
    />
  </div>
);

const TabContent: React.FC<{
  activeTab: string;
  subtitleSize: number;
  setSubtitleSize: (v: number) => void;
  selectedVoice: string;
  setSelectedVoice: (v: string) => void;
  voiceSpeed: number;
  setVoiceSpeed: (v: number) => void;
  musicVolume: number;
  setMusicVolume: (v: number) => void;
  // Script tab props
  videoTopic: string;
  setVideoTopic: (v: string) => void;
  videoScript: string;
  setVideoScript: (v: string) => void;
  videoKeywords: string;
  setVideoKeywords: (v: string) => void;
  scriptLanguage: string;
  setScriptLanguage: (v: string) => void;
  isGeneratingScript: boolean;
  onGenerateScript: () => void;
  // Video tab props
  videoSource: string;
  setVideoSource: (v: string) => void;
  aspectRatio: string;
  setAspectRatio: (v: string) => void;
  maxSegmentDuration: number;
  setMaxSegmentDuration: (v: number) => void;
  concurrentVideos: number;
  setConcurrentVideos: (v: number) => void;
  // Audio tab props
  ttsServer: string;
  setTtsServer: (v: string) => void;
  voiceVolume: number;
  setVoiceVolume: (v: number) => void;
  backgroundMusic: string;
  setBackgroundMusic: (v: string) => void;
  // Subtitle tab props
  enableSubtitles: boolean;
  setEnableSubtitles: (v: boolean) => void;
  subtitlePosition: string;
  setSubtitlePosition: (v: string) => void;
  subtitleFont: string;
  setSubtitleFont: (v: string) => void;
}> = ({
  activeTab,
  subtitleSize,
  setSubtitleSize,
  selectedVoice,
  setSelectedVoice,
  voiceSpeed,
  setVoiceSpeed,
  musicVolume,
  setMusicVolume,
  videoTopic,
  setVideoTopic,
  videoScript,
  setVideoScript,
  videoKeywords,
  setVideoKeywords,
  scriptLanguage,
  setScriptLanguage,
  isGeneratingScript,
  onGenerateScript,
  videoSource,
  setVideoSource,
  aspectRatio,
  setAspectRatio,
  maxSegmentDuration,
  setMaxSegmentDuration,
  concurrentVideos,
  setConcurrentVideos,
  ttsServer,
  setTtsServer,
  voiceVolume,
  setVoiceVolume,
  backgroundMusic,
  setBackgroundMusic,
  enableSubtitles,
  setEnableSubtitles,
  subtitlePosition,
  setSubtitlePosition,
  subtitleFont,
  setSubtitleFont,
}) => {
  // Tab Kịch bản
  if (activeTab === "script")
    return (
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Edit size={14} />
            Chủ Đề Video
          </label>
          <input
            type="text"
            value={videoTopic}
            onChange={(e) => setVideoTopic(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Nhập chủ đề video..."
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Layers size={14} />
            Ngôn ngữ cho kịch bản video
          </label>
          <select
            value={scriptLanguage}
            onChange={(e) => setScriptLanguage(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="Tiếng Việt">Tiếng Việt</option>
            <option value="Tiếng Anh">Tiếng Anh</option>
            <option value="Tiếng Pháp">Tiếng Pháp</option>
            <option value="Tiếng Nhật">Tiếng Nhật</option>
            <option value="Tiếng Hàn">Tiếng Hàn</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText size={14} />
            Kịch Bản Video
          </label>
          <textarea
            value={videoScript}
            onChange={(e) => setVideoScript(e.target.value)}
            rows={6}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            placeholder="Kịch bản video sẽ được tạo ở đây..."
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText size={14} />
            Từ Khóa Video
          </label>
          <input
            type="text"
            value={videoKeywords}
            onChange={(e) => setVideoKeywords(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Nhập từ khóa, phân cách bằng dấu phẩy..."
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText size={14} />
            Phong Cách Kịch Bản
          </label>
          <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
            <option value="professional">Chuyên nghiệp</option>
            <option value="casual">Thân thiện</option>
            <option value="humorous">Hài hước</option>
            <option value="educational">Giáo dục</option>
            <option value="dramatic">Kịch tính</option>
          </select>
        </div>

        <button
          onClick={onGenerateScript}
          disabled={isGeneratingScript}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingScript ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Edit size={16} /> Tạo Kịch Bản Với AI
            </>
          )}
        </button>
      </div>
    );

  // Tab Video
  if (activeTab === "video")
    return (
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Image size={14} className="flex-shrink-0" />
            Nguồn Video
          </label>
          <select
            value={videoSource}
            onChange={(e) => setVideoSource(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="pexels">Pexels</option>
            <option value="pixabay">Pixabay</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Layers size={14} className="flex-shrink-0" />
            Tỷ Lệ Khung Hình Video
          </label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="Dọc 9:16">Dọc 9:16</option>
            <option value="Ngang 16:9">Ngang 16:9</option>
            <option value="Vuông 1:1">Vuông 1:1</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Clock size={14} className="flex-shrink-0" />
            Thời Lượng Tối Đa Của Đoạn Video (giây)
          </label>
          <select
            value={maxSegmentDuration}
            onChange={(e) => setMaxSegmentDuration(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {[...Array(9)].map((_, i) => (
              <option key={i + 2} value={i + 2}>
                {i + 2}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Film size={14} className="flex-shrink-0" />
            Số Video Được Tạo Ra Đồng Thời
          </label>
          <select
            value={concurrentVideos}
            onChange={(e) => setConcurrentVideos(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {[...Array(5)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Video size={14} />
            Chất Lượng Video
          </label>
          <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
            <option value="1080p">Full HD (1080p)</option>
            <option value="720p">HD (720p)</option>
            <option value="480p">SD (480p)</option>
            <option value="4k">4K Ultra HD</option>
          </select>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium text-gray-900">
            Tự động tối ưu hóa chất lượng
          </span>
        </label>
      </div>
    );

  // Tab Phụ đề
  if (activeTab === "subtitle")
    return (
      <div className="space-y-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={enableSubtitles}
            onChange={(e) => setEnableSubtitles(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium text-gray-900">Bật phụ đề</span>
        </label>

        {enableSubtitles && (
          <>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Type size={14} className="flex-shrink-0" />
                Phông Chữ Phụ Đề
              </label>
              <select
                value={subtitleFont}
                onChange={(e) => setSubtitleFont(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="DancingScript.ttf">Dancing Script</option>
                <option value="UTM Kabel KT.ttf">UTM Kabel KT</option>
                <option value="Charm.ttf">Charm</option>
                <option value="Bangers.ttf">Bangers</option>
                <option value="Charm-Bold.ttf">Charm Bold</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Layers size={14} className="flex-shrink-0" />
                Vị trí phụ đề
              </label>
              <select
                value={subtitlePosition}
                onChange={(e) => setSubtitlePosition(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="top">Trên</option>
                <option value="center">Giữa</option>
                <option value="bottom">Dưới (Recommend)</option>
              </select>
            </div>
          </>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Type size={14} />
            Màu Chữ Phụ Đề
          </label>
          <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
            <option value="white">Trắng</option>
            <option value="black">Đen</option>
            <option value="yellow">Vàng</option>
            <option value="blue">Xanh dương</option>
            <option value="red">Đỏ</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Layers size={14} />
            Màu Nền Phụ Đề
          </label>
          <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
            <option value="transparent">Trong suốt</option>
            <option value="black">Đen</option>
            <option value="white">Trắng</option>
            <option value="gray">Xám</option>
          </select>
        </div>

        <Slider
          label="Cỡ chữ"
          value={subtitleSize}
          min={30}
          max={100}
          onChange={setSubtitleSize}
        />

        <Slider
          label="Độ trong suốt nền"
          value={80}
          min={0}
          max={100}
          onChange={() => {}}
        />
      </div>
    );

  // Tab Âm thanh
  if (activeTab === "audio")
    return (
      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Volume2 size={14} className="flex-shrink-0" />
            Máy Chủ TTS
          </label>
          <select
            value={ttsServer}
            onChange={(e) => setTtsServer(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="azure_tts_v1">Azure TTS V1 (Nhanh)</option>
            <option value="azure_tts_v2">
              Azure TTS V2 (Nhanh, Cần API Key)
            </option>
            <option value="gemini">
              Gemini 2.5 Flash TTS (Nhanh, Cần API Key)
            </option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Giọng Đọc Văn Bản
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {ttsServer === "azure_tts_v1" && (
              <>
                <option value="vi-VN-HoaiMyNeural">vi-VN-HoaiMyNeural</option>
                <option value="vi-VN-NamMinhNeural">vi-VN-NamMinhNeural</option>
              </>
            )}
            {ttsServer === "azure_tts_v2" && (
              <>
                <option value="en-US-AvaMultilingualNeural-V2">
                  en-US-AvaMultilingualNeural-V2 (Female)
                </option>
                <option value="en-US-AndrewMultilingualNeural-V2">
                  en-US-AndrewMultilingualNeural-V2 (Male)
                </option>
                <option value="en-US-EmmaMultilingualNeural-V2">
                  en-US-EmmaMultilingualNeural-V2 (Female)
                </option>
                <option value="en-US-BrianMultilingualNeural-V2">
                  en-US-BrianMultilingualNeural-V2 (Male)
                </option>
              </>
            )}
            {ttsServer === "gemini" && (
              <>
                <option value="Puck">Puck - Nam</option>
                <option value="Charon">Charon - Nam</option>
                <option value="Zephyr">Zephyr - Nữ</option>
                <option value="Kore">Kore - Nữ</option>
              </>
            )}
          </select>
        </div>

        <Slider
          label="Tốc Độ Giọng Đọc"
          value={voiceSpeed}
          min={0.5}
          max={2.0}
          step={0.1}
          onChange={setVoiceSpeed}
        />

        <Slider
          label="Âm Lượng Giọng Đọc"
          value={voiceVolume}
          min={0.6}
          max={5.0}
          step={0.1}
          onChange={setVoiceVolume}
        />

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Volume2 size={14} className="flex-shrink-0" />
            Âm Nhạc Nền
          </label>
          <select
            value={backgroundMusic}
            onChange={(e) => setBackgroundMusic(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="Ngẫu nhiên">Ngẫu nhiên</option>
            <option value="Không có">Không có</option>
          </select>
        </div>

        <Slider
          label="Âm Lượng Nhạc Nền"
          value={musicVolume}
          min={0.1}
          max={1.0}
          step={0.1}
          onChange={setMusicVolume}
        />

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Volume2 size={14} />
            Hiệu Ứng Âm Thanh
          </label>
          <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
            <option value="none">Không có hiệu ứng</option>
            <option value="echo">Tiếng vang</option>
            <option value="reverb">Hòa âm</option>
            <option value="pitch">Thay đổi tông</option>
          </select>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            defaultChecked
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="font-medium text-gray-900">
            Tự động điều chỉnh âm lượng
          </span>
        </label>
      </div>
    );

  return null;
};

const SingleVoiceMode: React.FC = () => {
  const { savedApiKeys } = useApiKeys();
  const {
    completedVideos,
    videoProgress,
    startVideoCreation,
    stopVideoCreation,
  } = useVideoProgress();
  const [activeTab, setActiveTab] = useState("script");
  const [selectedVideo] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("vi-VN-HoaiMyNeural");
  const [subtitleSize, setSubtitleSize] = useState(60);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [musicVolume, setMusicVolume] = useState(0.2);

  // Video settings
  const [videoSource, setVideoSource] = useState("Pexels");
  const [aspectRatio, setAspectRatio] = useState("Dọc 9:16");
  const [maxSegmentDuration, setMaxSegmentDuration] = useState(5);
  const [concurrentVideos, setConcurrentVideos] = useState(1);

  // Audio settings
  const [ttsServer, setTtsServer] = useState("azure_tts_v1");
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [backgroundMusic, setBackgroundMusic] = useState("Ngẫu nhiên");

  // Subtitle settings
  const [enableSubtitles, setEnableSubtitles] = useState(true);
  const [subtitlePosition, setSubtitlePosition] = useState("bottom");
  const [subtitleFont, setSubtitleFont] = useState("Charm-Bold.ttf");

  // Script state
  const [videoTopic, setVideoTopic] = useState(
    () => sessionStorage.getItem("videoTopic") || ""
  );
  const [videoScript, setVideoScript] = useState(
    () => sessionStorage.getItem("videoScript") || ""
  );
  const [videoKeywords, setVideoKeywords] = useState(
    () => sessionStorage.getItem("videoKeywords") || ""
  );
  const [scriptLanguage, setScriptLanguage] = useState(
    () => sessionStorage.getItem("scriptLanguage") || "Tiếng Việt"
  );
  const [selectedAiProvider] = useState(() => {
    if (savedApiKeys.gemini_api_key) return "gemini";
    if (savedApiKeys.openai_api_key) return "openai";
    return "gemini";
  });
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Post video states
  const [showPostModal, setShowPostModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [videoTitle] = useState("");
  const [videoDescription] = useState("");
  const [videoHashtags] = useState("");

  // Save to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("videoTopic", videoTopic);
    sessionStorage.setItem("videoScript", videoScript);
    sessionStorage.setItem("videoKeywords", videoKeywords);
    sessionStorage.setItem("scriptLanguage", scriptLanguage);
  }, [videoTopic, videoScript, videoKeywords, scriptLanguage]);

  const geminiApiKey = savedApiKeys.gemini_api_key;
  const openaiApiKey = savedApiKeys.openai_api_key;

  // Update voice when TTS server changes
  useEffect(() => {
    if (ttsServer === "azure_tts_v1") {
      if (!selectedVoice.startsWith("vi-VN-")) {
        setSelectedVoice("vi-VN-HoaiMyNeural");
      }
    } else if (ttsServer === "azure_tts_v2") {
      if (!selectedVoice.includes("MultilingualNeural-V2")) {
        setSelectedVoice("en-US-AvaMultilingualNeural-V2");
      }
    } else if (ttsServer === "gemini") {
      if (!["Puck", "Charon", "Zephyr", "Kore"].includes(selectedVoice)) {
        setSelectedVoice("Puck");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttsServer]);

  const handleGenerateScriptAndKeywords = async () => {
    if (!videoTopic.trim()) {
      alert("Vui lòng nhập chủ đề video");
      return;
    }

    setIsGeneratingScript(true);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const token = getAuthToken();
      console.log("geminiApiKey", geminiApiKey);
      console.log("openaiApiKey", openaiApiKey);
      console.log("selectedAiProvider", selectedAiProvider);
      console.log("videoTopic", videoTopic);
      console.log("scriptLanguage", scriptLanguage);
      // Generate script
      const scriptResponse = await fetch(
        `${apiBaseUrl}/api/v1/scheduled-videos/generate-script`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            video_subject: videoTopic,
            video_language:
              scriptLanguage === "Tiếng Việt" ? "Vietnamese" : "English",
            paragraph_number: 1,
            gemini_key: selectedAiProvider === "gemini" ? geminiApiKey : null,
            openai_key: selectedAiProvider === "openai" ? openaiApiKey : null,
            llm_provider: selectedAiProvider,
          }),
        }
      );
      console.log("scriptResponse", scriptResponse);

      if (scriptResponse.ok) {
        const scriptData = await scriptResponse.json();
        // API trả về field 'script' thay vì 'video_script'
        const generatedScript =
          scriptData.data?.script || scriptData.data?.video_script;

        if (!generatedScript) {
          alert("Không nhận được kịch bản từ API. Vui lòng thử lại.");
          setIsGeneratingScript(false);
          return;
        }

        setVideoScript(generatedScript);

        // Generate keywords
        const videoApiBaseUrl = getVideoApiBaseUrl();
        const keywordsResponse = await fetch(
          `${videoApiBaseUrl}/api/v1/terms`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
              video_subject: videoTopic,
              video_script: generatedScript,
              amount: 5,
              gemini_key: selectedAiProvider === "gemini" ? geminiApiKey : null,
              openai_key: selectedAiProvider === "openai" ? openaiApiKey : null,
              llm_provider: selectedAiProvider,
            }),
          }
        );

        if (keywordsResponse.ok) {
          const keywordsData = await keywordsResponse.json();
          const keywords = keywordsData.data.video_terms.join(", ");
          setVideoKeywords(keywords);
        }
      } else {
        alert("Lỗi khi tạo kịch bản");
      }
    } catch (error) {
      console.error("Error generating script and keywords:", error);
      console.log("error", error);
      alert("Lỗi kết nối khi tạo kịch bản");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const currentVideo = VIDEOS.find((v) => v.id === selectedVideo);

  // Handle post video to social media
  const handlePostVideo = async (
    selectedAccounts: SelectedAccount[],
    videoFile: File,
    postContent: PostContent
  ) => {
    setIsPosting(true);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const token = getAuthToken();

      if (!token) {
        throw new Error("Vui lòng đăng nhập để đăng bài");
      }

      // Build preview_content based on selected platforms
      const previewContent: Record<
        string,
        {
          content:
            | string
            | { title: string; description: string; tags: string[] };
        }
      > = {};

      selectedAccounts.forEach((account) => {
        if (account.platform_type === "youtube") {
          // YouTube format
          previewContent.youtube = {
            content: {
              title: postContent.title || videoTopic,
              description:
                postContent.description || videoScript.substring(0, 5000),
              tags: postContent.hashtags
                ? postContent.hashtags
                    .split(",")
                    .map((t) => t.trim().replace("#", ""))
                : videoKeywords.split(",").map((k) => k.trim()),
            },
          };
        } else {
          // Facebook and Instagram format
          const content =
            postContent.description || videoScript.substring(0, 2000);
          const hashtags = postContent.hashtags || videoKeywords;
          previewContent[account.platform_type] = {
            content: `${content}\n\n${hashtags}`,
          };
        }
      });

      // Build platform_specific_data
      const platformSpecificData = selectedAccounts.map((account) => ({
        platform_type: account.platform_type,
        social_account_id: account.id,
      }));

      // Create FormData
      const formData = new FormData();
      formData.append("preview_content", JSON.stringify(previewContent));
      formData.append("scheduled_at", new Date().toISOString());
      formData.append(
        "platform_specific_data",
        JSON.stringify(platformSpecificData)
      );
      formData.append("media_files", videoFile);
      formData.append("publish_immediately", "true");

      // Call schedule-post API
      const response = await fetch(
        `${apiBaseUrl}/api/v1/scheduled-videos/schedule-post`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi đăng bài");
      }

      await response.json();
      alert(`Đã đăng bài thành công lên ${selectedAccounts.length} nền tảng!`);

      // Close modal
      setShowPostModal(false);
    } catch (error: unknown) {
      console.error("Error posting video:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra";
      alert(`Lỗi khi đăng bài: ${errorMessage}`);
    } finally {
      setIsPosting(false);
    }
  };

  // Handle create video
  const handleCreateVideo = async () => {
    if (!videoTopic.trim() || !videoScript.trim() || !videoKeywords.trim()) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const videoApiBaseUrl = getVideoApiBaseUrl();

      // Map UI values to API values
      const aspectRatioMap: { [key: string]: string } = {
        "Dọc 9:16": "9:16",
        "Ngang 16:9": "16:9",
        "Vuông 1:1": "1:1",
      };

      const positionMap: { [key: string]: string } = {
        top: "top",
        center: "center",
        bottom: "bottom",
        custom: "custom",
      };

      const bgmTypeMap: { [key: string]: string } = {
        "Ngẫu nhiên": "random",
        "Không có": "none",
      };

      const ttsServerMap: { [key: string]: string } = {
        azure_tts_v1: "azure-tts-v1",
        azure_tts_v2: "azure-tts-v2",
        gemini: "gemini",
      };

      const normalizedAspectRatio = aspectRatioMap[aspectRatio] || "9:16";
      const normalizedVideoSource =
        videoSource.trim().toLowerCase() || "pexels";
      const normalizedSubtitlePosition =
        positionMap[subtitlePosition] || "bottom";
      const normalizedBgmType = bgmTypeMap[backgroundMusic] || "random";
      const normalizedTtsServer = ttsServerMap[ttsServer] || ttsServer;

      const requestBody = {
        video_subject: videoTopic,
        video_script: videoScript,
        video_terms: videoKeywords,
        video_aspect: normalizedAspectRatio,
        video_concat_mode: "random",
        video_transition_mode: "None",
        video_clip_duration: maxSegmentDuration,
        video_count: concurrentVideos,
        video_source: normalizedVideoSource,
        video_materials: [
          {
            provider: normalizedVideoSource,
            url: "",
            duration: 0,
          },
        ],
        video_language:
          scriptLanguage === "Tiếng Việt" ? "Vietnamese" : "English",
        voice_name: selectedVoice,
        voice_volume: voiceVolume,
        tts_server: normalizedTtsServer,
        voice_rate: voiceSpeed,
        bgm_type: normalizedBgmType,
        bgm_file: "",
        bgm_volume: musicVolume,
        subtitle_enabled: enableSubtitles,
        type_subtitle: "normal",
        subtitle_provider: "edge",
        subtitle_position: normalizedSubtitlePosition,
        custom_position: 70,
        font_name: subtitleFont,
        text_fore_color: "#FFFFFF",
        text_background_color: true,
        font_size: subtitleSize,
        stroke_color: "#000000",
        stroke_width: 1.5,
        n_threads: 4,
        paragraph_number: 1,
        gemini_key: geminiApiKey || "",
        openai_key: openaiApiKey || "",
        speech_key: "",
        speech_region: "",
      };

      const response = await fetch(`${videoApiBaseUrl}/api/v1/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const taskId = data.data.task_id;
        startVideoCreation(taskId);
        alert("Đã bắt đầu tạo video! Vui lòng đợi video được tạo xong.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Lỗi khi tạo video");
      }
    } catch (error) {
      console.error("Error creating video:", error);
      alert("Lỗi kết nối khi tạo video");
    }
  };

  const resetForm = () => {
    const defaultState = {
      videoTopic: "",
      videoScript: "",
      videoKeywords: "",
      scriptLanguage: "Tiếng Việt",
      voiceSpeed: 1.0,
      voiceVolume: 1.0,
      subtitleSize: 60,
      subtitlePosition: "bottom",
      subtitleFont: "Charm-Bold.ttf",
      enableSubtitles: true,
      backgroundMusic: "Ngẫu nhiên",
      musicVolume: 0.2,
      videoSource: "Pexels",
      aspectRatio: "Dọc 9:16",
      maxSegmentDuration: 5,
      concurrentVideos: 1,
      ttsServer: "azure_tts_v1",
      selectedVoice: "vi-VN-HoaiMyNeural",
    };

    setVideoTopic(defaultState.videoTopic);
    setVideoScript(defaultState.videoScript);
    setVideoKeywords(defaultState.videoKeywords);
    setScriptLanguage(defaultState.scriptLanguage);
    setVoiceSpeed(defaultState.voiceSpeed);
    setVoiceVolume(defaultState.voiceVolume);
    setSubtitleSize(defaultState.subtitleSize);
    setSubtitlePosition(defaultState.subtitlePosition);
    setSubtitleFont(defaultState.subtitleFont);
    setEnableSubtitles(defaultState.enableSubtitles);
    setBackgroundMusic(defaultState.backgroundMusic);
    setMusicVolume(defaultState.musicVolume);
    setVideoSource(defaultState.videoSource);
    setAspectRatio(defaultState.aspectRatio);
    setMaxSegmentDuration(defaultState.maxSegmentDuration);
    setConcurrentVideos(defaultState.concurrentVideos);
    setTtsServer(defaultState.ttsServer);
    setSelectedVoice(defaultState.selectedVoice);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Bạn có chắc muốn đặt lại? Video đã tạo và các dữ liệu nhập sẽ bị xóa."
      )
    ) {
      resetForm();
      sessionStorage.removeItem("videoTopic");
      sessionStorage.removeItem("videoScript");
      sessionStorage.removeItem("videoKeywords");
      sessionStorage.removeItem("scriptLanguage");
      stopVideoCreation();
    }
  };

  const handleCreateVideoClick = () => {
    handleCreateVideo();
  };

  const handleOpenPostModal = () => {
    if (completedVideos.length === 0) {
      alert("Vui lòng tạo và hoàn thành video trước khi đăng bài.");
      return;
    }
    setShowPostModal(true);
  };

  return (
    <div className="w-full gap-6 lg:gap-8">
      {/* Settings Panel */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6 lg:p-8 order-2 lg:order-1">
        {/* Mobile Tab Select */}
        <MobileTabSelect activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Desktop Tabs */}
        <div className="hidden lg:block border-b border-gray-200 mb-6">
          <div className="flex -mb-px overflow-x-auto">
            {TABS.map((tab) => (
              <Tab
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </div>
        </div>

        <TabContent
          activeTab={activeTab}
          subtitleSize={subtitleSize}
          setSubtitleSize={setSubtitleSize}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          voiceSpeed={voiceSpeed}
          setVoiceSpeed={setVoiceSpeed}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          videoTopic={videoTopic}
          setVideoTopic={setVideoTopic}
          videoScript={videoScript}
          setVideoScript={setVideoScript}
          videoKeywords={videoKeywords}
          setVideoKeywords={setVideoKeywords}
          scriptLanguage={scriptLanguage}
          setScriptLanguage={setScriptLanguage}
          isGeneratingScript={isGeneratingScript}
          onGenerateScript={handleGenerateScriptAndKeywords}
          videoSource={videoSource}
          setVideoSource={setVideoSource}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          maxSegmentDuration={maxSegmentDuration}
          setMaxSegmentDuration={setMaxSegmentDuration}
          concurrentVideos={concurrentVideos}
          setConcurrentVideos={setConcurrentVideos}
          ttsServer={ttsServer}
          setTtsServer={setTtsServer}
          voiceVolume={voiceVolume}
          setVoiceVolume={setVoiceVolume}
          backgroundMusic={backgroundMusic}
          setBackgroundMusic={setBackgroundMusic}
          enableSubtitles={enableSubtitles}
          setEnableSubtitles={setEnableSubtitles}
          subtitlePosition={subtitlePosition}
          setSubtitlePosition={setSubtitlePosition}
          subtitleFont={subtitleFont}
          setSubtitleFont={setSubtitleFont}
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-8">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
          >
            <RefreshCw size={16} /> Đặt Lại
          </button>
          <button
            onClick={handleCreateVideoClick}
            disabled={videoProgress.isCreating}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md text-sm ${
              videoProgress.isCreating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {videoProgress.isCreating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang tạo...
              </>
            ) : (
              <>
                <Play size={16} /> Tạo Video
              </>
            )}
          </button>
        </div>

        <div className="mt-3">
          <button
            onClick={handleOpenPostModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors text-sm"
          >
            <Send size={16} /> Đăng bài ngay
          </button>
        </div>

        {/* Video Progress Display */}
        <div className="mt-6">
          <VideoProgressDisplay
            progress={videoProgress}
            onStop={stopVideoCreation}
          />
        </div>

        {completedVideos.length > 0 && (
          <div className="mt-8">
            <VideoGallery videos={completedVideos} />
          </div>
        )}
      </div>

      {/* Preview Panel */}
      {/* <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 md:p-6 lg:p-8 order-1 lg:order-2">
          <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-gray-200">
            <Film size={20} className="text-blue-600 flex-shrink-0" />
            Chọn Video
          </h2>

          <div className="bg-gray-50 rounded-lg p-3 lg:p-5 mb-4 lg:mb-6 max-h-64 lg:max-h-96 overflow-y-auto border border-gray-200">
            {VIDEOS.map((video) => (
              <VideoItem
                key={video.id}
                video={video}
                selected={selectedVideo === video.id}
                onClick={() => {
                  setSelectedVideo(video.id);
                  setShowModal(true);
                }}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Type size={14} className="flex-shrink-0" /> Tiêu đề video
              </label>
              <input
                type="text"
                value={videoTitle || currentVideo?.title || ""}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Nhập tiêu đề video..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={14} className="flex-shrink-0" /> Mô tả video
              </label>
              <textarea
                rows={3}
                value={videoDescription || currentVideo?.description || ""}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                placeholder="Nhập mô tả video..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={14} className="flex-shrink-0" /> Hashtags
              </label>
              <input
                type="text"
                value={videoHashtags}
                onChange={(e) => setVideoHashtags(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="#video #content #socialmedia"
              />
            </div>
          </div>
        </div> */}

      <VideoModal
        show={showModal}
        onClose={() => setShowModal(false)}
        video={currentVideo}
      />

      <VideoPostModal
        show={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPost={handlePostVideo}
        defaultPostContent={{
          title: videoTitle || videoTopic,
          description: videoDescription || videoScript,
          hashtags: videoHashtags || videoKeywords,
        }}
        isPosting={isPosting}
        completedVideos={completedVideos}
      />
    </div>
  );
};

export const VideoPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<"single" | "podcast">(() => {
    const saved = sessionStorage.getItem("video_creation_mode");
    return saved === "podcast" ? "podcast" : "single";
  });

  const handleModeChange = (nextMode: "single" | "podcast") => {
    setMode(nextMode);
    sessionStorage.setItem("video_creation_mode", nextMode);
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-8">
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
            Tạo Video
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Chuyên Nghiệp
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Tạo video chất lượng cao với AI, tùy chỉnh âm thanh và phụ đề theo ý
            muốn.
          </p>
        </div>
        <div className="flex justify-center mb-6 lg:mb-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-1 flex gap-1">
            <button
              type="button"
              onClick={() => handleModeChange("single")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 ${
                mode === "single"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              aria-pressed={mode === "single"}
            >
              <Speech size={20} />
              <span className="text-sm sm:text-base">Chế độ 1 giọng</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("podcast")}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 ${
                mode === "podcast"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              aria-pressed={mode === "podcast"}
            >
              <Podcast size={20} />
              <span className="text-sm sm:text-base">Chế độ Podcast</span>
            </button>
          </div>
        </div>
        {mode === "single" ? <SingleVoiceMode /> : <PodcastMode />}
      </main>
    </div>
  );
};

export default VideoPage;
