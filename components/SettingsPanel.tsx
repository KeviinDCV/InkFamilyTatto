"use client";

import DownloadButton from "./DownloadButton";

interface SettingsPanelProps {
  stencilImage: string | null;
}

export default function SettingsPanel({
  stencilImage,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Download Button */}
      {stencilImage && (
        <DownloadButton stencilImage={stencilImage} />
      )}
    </div>
  );
}

