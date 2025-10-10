import React from 'react';

const StickerPicker = ({ onSelectSticker }) => {
  // Liste d'emojis/stickers populaires (vous pouvez étendre cette liste)
  const stickers = [
    { id: 1, name: 'Smile', url: '😊' },
    { id: 2, name: 'Heart', url: '❤️' },
    { id: 3, name: 'Laugh', url: '😂' },
    { id: 4, name: 'Thumbs Up', url: '👍' },
    { id: 5, name: 'Fire', url: '🔥' },
    { id: 6, name: 'Party', url: '🎉' },
    { id: 7, name: 'Clap', url: '👏' },
    { id: 8, name: 'Star', url: '⭐' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-2 w-64">
      <div className="grid grid-cols-4 gap-2">
        {stickers.map(sticker => (
          <button
            key={sticker.id}
            onClick={() => onSelectSticker(sticker)}
            className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            {sticker.url}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StickerPicker;