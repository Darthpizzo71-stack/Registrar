import React, { useState } from 'react'
import { Meeting } from '../../types'

interface VideoPlayerProps {
  meeting: Meeting
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ meeting }) => {
  const [error] = useState<string | null>(null)

  if (!meeting.video_url && !meeting.video_embed_code) {
    return null
  }

  const renderVideo = () => {
    // Direct embed code
    if (meeting.video_embed_code) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: meeting.video_embed_code }}
          className="w-full aspect-video"
        />
      )
    }

    // YouTube
    if (meeting.video_type === 'youtube' && meeting.video_url) {
      const videoId = extractYouTubeId(meeting.video_url)
      if (videoId) {
        return (
          <iframe
            className="w-full aspect-video rounded-lg"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={meeting.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )
      }
    }

    // Vimeo
    if (meeting.video_type === 'vimeo' && meeting.video_url) {
      const videoId = extractVimeoId(meeting.video_url)
      if (videoId) {
        return (
          <iframe
            className="w-full aspect-video rounded-lg"
            src={`https://player.vimeo.com/video/${videoId}`}
            title={meeting.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )
      }
    }

    // Direct video URL
    if (meeting.video_type === 'direct' && meeting.video_url) {
      return (
        <video
          className="w-full aspect-video rounded-lg"
          controls
          src={meeting.video_url}
        >
          Your browser does not support the video tag.
        </video>
      )
    }

    return null
  }

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const extractVimeoId = (url: string): string | null => {
    const regExp = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Meeting Video</h3>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        {renderVideo()}
      </div>
    </div>
  )
}

