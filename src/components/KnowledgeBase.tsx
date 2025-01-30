import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Book,
  BookOpen,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Printer,
  Clock,
  Tag,
  User,
  Plus,
  FolderPlus,
  Edit,
  Trash2,
  FileText,
  Filter,
  ArrowUpRight,
  BookMarked,
  Bookmark,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ArticleForm } from './ArticleForm';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  helpful: number;
  notHelpful: number;
  comments: {
    id: string;
    content: string;
    author: string;
    createdAt: string;
  }[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: any;
}

export function KnowledgeBase() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Check if user has permission to manage articles
  const canManageArticles = user?.role === 'head' || user?.department === 'IT';

  // Load articles from localStorage on component mount
  const [articles, setArticles] = useState<Article[]>(() => {
    const savedArticles = localStorage.getItem('knowledgeBaseArticles');
    return savedArticles ? JSON.parse(savedArticles) : [];
  });

  // Save articles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('knowledgeBaseArticles', JSON.stringify(articles));
  }, [articles]);

  // Sample categories
  const categories: Category[] = [
    {
      id: 'software',
      name: 'Software',
      description: 'Common software issues and solutions',
      icon: FileText
    },
    {
      id: 'hardware',
      name: 'Hardware',
      description: 'Hardware troubleshooting and maintenance',
      icon: Printer
    },
    {
      id: 'network',
      name: 'Network',
      description: 'Network connectivity and configuration',
      icon: Share2
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Security best practices and guidelines',
      icon: BookMarked
    }
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }

      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          article.title.toLowerCase().includes(search) ||
          article.content.toLowerCase().includes(search) ||
          article.tags.some(tag => tag.toLowerCase().includes(search))
        );
      }

      return true;
    });
  }, [articles, selectedCategory, searchQuery]);

  const handleArticleClick = (article: Article) => {
    // Update view count when article is opened
    const updatedArticle = {
      ...article,
      views: article.views + 1
    };

    setArticles(prev => prev.map(a => a.id === article.id ? updatedArticle : a));
    setSelectedArticle(updatedArticle);
  };

  const handleAddComment = () => {
    if (!selectedArticle || !newComment.trim()) return;

    const updatedArticle = {
      ...selectedArticle,
      comments: [
        ...selectedArticle.comments,
        {
          id: crypto.randomUUID(),
          content: newComment.trim(),
          author: user?.name || 'Anonymous',
          createdAt: new Date().toISOString()
        }
      ]
    };

    setArticles(prev => prev.map(a => a.id === updatedArticle.id ? updatedArticle : a));
    setSelectedArticle(updatedArticle);
    setNewComment('');
  };

  const handleNewArticle = (articleData: any) => {
    const newArticle = {
      ...articleData,
      id: `kb-${Date.now()}`,
      author: user?.name || 'Anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      helpful: 0,
      notHelpful: 0,
      comments: []
    };

    setArticles(prev => [newArticle, ...prev]);
    setShowArticleForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-600">Find solutions and documentation for common issues</p>
          </div>
          {canManageArticles && (
            <button
              onClick={() => setShowArticleForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Article
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map(category => {
          const Icon = category.icon;
          const articleCount = articles.filter(a => a.category === category.id).length;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left
                ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              <div className="text-sm text-gray-500">
                {articleCount} article{articleCount !== 1 ? 's' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Articles List */}
      {!selectedArticle && (
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
          {filteredArticles.map(article => (
            <button
              key={article.id}
              onClick={() => handleArticleClick(article)}
              className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{article.helpful}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{article.comments.length} comments</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Article View */}
      {selectedArticle && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
                Back to Articles
              </button>
              {canManageArticles && (
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedArticle.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{selectedArticle.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Updated {new Date(selectedArticle.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{selectedArticle.views} views</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{selectedArticle.helpful}</span>
                </button>
                <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <ThumbsDown className="h-4 w-4" />
                  <span>{selectedArticle.notHelpful}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 prose max-w-none">
            <div className="markdown-content whitespace-pre-wrap">
              {selectedArticle.content}
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Comments ({selectedArticle.comments.length})
            </h3>
            <div className="space-y-4">
              {selectedArticle.comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-900">{comment.author}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}

              <div className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Form Modal */}
      {showArticleForm && (
        <ArticleForm
          onClose={() => setShowArticleForm(false)}
          onSubmit={handleNewArticle}
        />
      )}
    </div>
  );
}