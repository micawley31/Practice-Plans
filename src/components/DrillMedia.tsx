import type { Drill } from "../types";
import { getVideoEmbedUrl } from "../utils/videoEmbed";
import { CourtDiagram } from "./CourtDiagram";
import { PlayIcon } from "./icons";

interface Props {
  drill: Drill;
}

/** Read-only video + diagram section, shared by DrillDetailModal and
 * DrillInfoModal so the two don't drift out of sync. Renders nothing if the
 * drill has neither. */
export function DrillMedia({ drill }: Props) {
  const hasDiagram = Boolean(
    drill.diagram && (drill.diagram.players.length > 0 || drill.diagram.arrows.length > 0)
  );
  if (!drill.videoUrl && !hasDiagram) return null;

  const embedUrl = drill.videoUrl ? getVideoEmbedUrl(drill.videoUrl) : null;

  return (
    <>
      {drill.videoUrl &&
        (embedUrl ? (
          <div className="video-embed-wrapper">
            <iframe src={embedUrl} title={`${drill.name} video`} allowFullScreen />
          </div>
        ) : (
          <a
            href={drill.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="video-link"
          >
            <PlayIcon /> Watch video
          </a>
        ))}
      {hasDiagram && drill.diagram && <CourtDiagram diagram={drill.diagram} />}
    </>
  );
}
