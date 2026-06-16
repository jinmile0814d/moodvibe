'use client';

interface Props {
  song: string;
  artist: string;
  cover: string | null;
  onClick: () => void;
  onDelete?: () => void;
}

export default function SongItem({ song, artist, cover, onClick, onDelete }: Props) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-2.5 py-1.5 px-2 rounded-xl active:bg-gray-100 transition-colors min-w-0"
      >
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {cover ? (
            <img src={cover} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm text-gray-700 truncate">{song} - {artist}</p>
        </div>
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 text-gray-300 hover:text-red-400 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
