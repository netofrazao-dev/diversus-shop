import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStories } from '../../hooks/useProducts';
import StoryViewer from './StoryViewer';

/**
 * StoriesBar — fileira de bolinhas com as fotos/vídeos mais recentes da
 * loja, estilo Stories do Instagram. Clicar abre o visualizador em tela
 * cheia começando naquele story.
 */
export default function StoriesBar() {
  const { data: stories, isLoading } = useStories();
  const [viewerIndex, setViewerIndex] = useState(null);

  if (isLoading || !stories || stories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {stories.map((story, index) => (
          <button
            key={story.id}
            onClick={() => setViewerIndex(index)}
            className="flex flex-col items-center gap-1.5 shrink-0 w-20"
          >
            <div className="w-16 h-16 rounded-full border-3 border-primary p-0.5 bg-white shadow-cartoon-sm">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-black bg-primary-50 flex items-center justify-center">
                {story.media_type === 'video' ? (
                  <video src={story.media_url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={story.media_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
            <span className="text-[11px] font-display font-semibold text-black/70 truncate w-full text-center">
              {story.caption ? story.caption.slice(0, 12) : 'Novidade'}
            </span>
          </button>
        ))}
      </div>

      {viewerIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </section>
  );
}
