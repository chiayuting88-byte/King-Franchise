import React, { useState } from 'react';
import { MessageSquareQuote, ThumbsUp, MessageCircle, Pin, Plus, Mail, Send, CheckCircle2 } from 'lucide-react';
import { ForumPost } from '../types';

interface ManagerForumViewProps {
  forumPosts: ForumPost[];
  onAddPost: (post: ForumPost) => void;
  onOpenSupport: () => void;
}

export const ManagerForumView: React.FC<ManagerForumViewProps> = ({
  forumPosts,
  onAddPost,
  onOpenSupport,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});

  // New post form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ForumPost['category']>('Rostering Tips');
  const [authorName, setAuthorName] = useState('Sarah Chen');
  const [authorCompany, setAuthorCompany] = useState('Pacific Roasters & Deli');

  const filteredPosts = forumPosts.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const handleLike = (id: string, currentLikes: number) => {
    const existing = likesMap[id];
    setLikesMap({
      ...likesMap,
      [id]: existing ? existing + 1 : currentLikes + 1,
    });
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      authorName,
      authorRole: 'General Manager',
      authorCompany,
      avatarUrl: '/src/assets/images/avatar_manager_sarah_1792051520720.jpg',
      title: title.trim(),
      content: content.trim(),
      category,
      likesCount: 1,
      commentsCount: 0,
      createdAt: 'Just now',
    };

    onAddPost(newPost);
    setIsNewPostModalOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <span>Peer-to-Peer Manager Network</span>
              <span aria-hidden="true">·</span>
              <span>Roster Playbooks</span>
              <span aria-hidden="true">·</span>
              <span>Direct Support</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Manager C2C Forum & Exchange
            </h1>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
              Exchange tested scheduling templates, call-out mitigation strategies, and contract pool tips with fellow shift managers and store operators.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={onOpenSupport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-neutral-600" />
              <span>Email Support</span>
            </button>
            <button
              onClick={() => setIsNewPostModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Share Discussion</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-neutral-100 rounded-lg text-xs mt-6">
          {(['all', 'Rostering Tips', 'Contract Staffing', 'Labor Laws', 'Emergency Relievers'] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-neutral-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Topics' : cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Forum Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const likes = likesMap[post.id] ?? post.likesCount;

          return (
            <div
              key={post.id}
              className={`bg-white border rounded-xl p-5 transition-colors ${
                post.pinned
                  ? 'border-slate-900/40 bg-slate-50/30'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {/* Pinned & Category Metadata */}
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <div className="flex items-center gap-2">
                  {post.pinned && (
                    <span className="flex items-center gap-1 text-slate-900 font-semibold">
                      <Pin className="w-3 h-3 text-slate-900 fill-slate-900" />
                      Featured Strategy
                    </span>
                  )}
                  {post.pinned && <span aria-hidden="true">·</span>}
                  <span className="font-medium text-neutral-700">{post.category}</span>
                </div>
                <span>{post.createdAt}</span>
              </div>

              {/* Title */}
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                {post.title}
              </h2>

              {/* Content Body */}
              <p className="text-xs text-neutral-700 mt-2 leading-relaxed">
                {post.content}
              </p>

              {/* Author & Engagement Row */}
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.avatarUrl}
                    alt={post.authorName}
                    className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900">
                      {post.authorName}
                    </span>
                    <span className="text-neutral-500 ml-1.5">
                      {post.authorRole} · {post.authorCompany}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(post.id, post.likesCount)}
                    className="flex items-center gap-1 text-xs text-neutral-600 hover:text-slate-900 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{likes}</span>
                  </button>
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{post.commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Discussion Modal */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h3 className="text-base font-semibold text-slate-900">
                Start a Manager Discussion
              </h3>
              <button
                onClick={() => setIsNewPostModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Handling last-minute Sunday morning call-outs"
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ForumPost['category'])
                    }
                    className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Rostering Tips">Rostering Tips</option>
                    <option value="Contract Staffing">Contract Staffing</option>
                    <option value="Labor Laws">Labor Laws</option>
                    <option value="Emergency Relievers">Emergency Relievers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Your Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={authorCompany}
                    onChange={(e) => setAuthorCompany(e.target.value)}
                    placeholder="e.g. Acme Coffee Co."
                    className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Your Insights or Question
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share details about what worked for your store or what problem you're trying to solve..."
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
