import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "./AuthContext";

const API_BASE_URL = (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : null) || 'http://localhost:8000';

// PostCard Component with subtle animations
const PostCard = ({ post, onFeedback }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '20px',
        margin: '16px 0',
        color: 'white'
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Post #{post.id}</h3>
          <p style={{ margin: '4px 0', opacity: 0.8, fontSize: '0.9rem' }}>
            Score: {post.nudity_score ? post.nudity_score.toFixed(3) : 'N/A'} | ID: {post.post_id}
          </p>
        </div>
        <div style={{
          background: post.ai_label === 'explicit' ? 'rgba(255, 68, 68, 0.2)' : 'rgba(76, 175, 80, 0.2)',
          color: post.ai_label === 'explicit' ? '#ff4444' : '#4caf50',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          border: `1px solid ${post.ai_label === 'explicit' ? '#ff4444' : '#4caf50'}`
        }}>
          AI: {post.ai_label?.toUpperCase() || 'UNKNOWN'}
        </div>
      </div>

      {/* Media Content */}
      <div style={{ marginBottom: '20px' }}>
        {post.media_type === 'image' && post.media_url ? (
          <img
            src={`http://localhost:8000/proxy-image?url=${encodeURIComponent(post.media_url)}`}
            alt="Flagged content"
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
            onError={(e) => {
              e.target.src = '/fallback.jpg';
            }}
          />
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
            <p>Media content unavailable</p>
          </div>
        )}
      </div>

      {/* Text Content */}
      {post.text_content && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', opacity: 0.8 }}>Text Content:</h4>
          <p style={{ margin: 0, lineHeight: 1.5 }}>"{post.text_content}"</p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFeedback(post.id, 'safe')}
          style={{
            background: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ✅ Mark Safe
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFeedback(post.id, 'explicit')}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🚫 Confirm Explicit
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFeedback(post.id, 'unclear')}
          style={{
            background: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ❓ Unclear
        </motion.button>
      </div>
    </motion.div>
  );
};

// Enhanced Pagination Component with page numbers
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      margin: '24px 0',
      flexWrap: 'wrap'
    }}>
      {/* Previous Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          background: currentPage === 1 ? '#666' : '#4a90e2',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '6px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        ← Previous
      </motion.button>

      {/* Page Numbers */}
      {getVisiblePages().map((pageNum, index) => (
        pageNum === '...' ? (
          <span key={`dots-${index}`} style={{ color: 'white', padding: '0 8px' }}>
            ...
          </span>
        ) : (
          <motion.button
            key={pageNum}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPageChange(pageNum)}
            style={{
              background: currentPage === pageNum ? '#4a90e2' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: currentPage === pageNum ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {pageNum}
          </motion.button>
        )
      ))}

      {/* Next Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          background: currentPage === totalPages ? '#666' : '#4a90e2',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '6px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        Next →
      </motion.button>
    </div>
  );
};

// Page Info Component
const PageInfo = ({ currentPage, totalPages, totalItems, itemsPerPage }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div style={{
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '0.9rem',
      margin: '16px 0'
    }}>
      Showing {startItem}-{endItem} of {totalItems} posts (Page {currentPage} of {totalPages})
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, explicit: 0, safe: 0, pending: 0 });
  const perPage = 30;

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const mediaResponse = await fetch('http://localhost:8000/media');
        const mediaData = await mediaResponse.json();

        const statsResponse = await fetch('http://localhost:8000/stats');
        const statsData = await statsResponse.json();
        
        const transformedPosts = mediaData.map(item => ({
          id: item.id,
          platform: 'Instagram',
          ai_label: item.flagged ? 'explicit' : 'safe',
          media_type: 'image',
          media_url: item.image_url,
          text_content: item.caption,
          post_id: item.post_id,
          nudity_score: item.nudity_score
        }));
        
        setPosts(transformedPosts);
        setStats({
          total: statsData.total_posts,
          explicit: statsData.flagged_posts || 0,
          safe: statsData.safe_posts || 0,
          pending: mediaData.length
        });
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sendFeedback = async (media_id, reviewer_label) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback?media_id=${media_id}&reviewer_label=${reviewer_label}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== media_id));
        
        setStats(prev => {
          const newStats = { 
            ...prev, 
            pending: Math.max(0, prev.pending - 1)
          };
          
          if (reviewer_label.toLowerCase() === 'safe') {
            newStats.safe = prev.safe + 1;
          } else if (reviewer_label.toLowerCase() === 'explicit') {
            newStats.explicit = prev.explicit + 1;
          }
          
          return newStats;
        });
        
        console.log(`✅ Feedback submitted for post ${media_id}: marked as ${reviewer_label}`);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (err) {
      console.error("❌ Feedback submission failed:", err);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const currentPosts = Array.isArray(posts)
    ? posts.slice((page - 1) * perPage, page * perPage)
    : [];

  const totalPages = Math.ceil(posts.length / perPage);

  return (
    <div style={{ 
      backgroundColor: "#0a0a0a", 
      color: "#fff", 
      minHeight: "100vh", 
      padding: "2rem"
    }}>
      <div style={{ 
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "2rem" }}
        >
          <h1 style={{ 
            fontSize: "2.5rem",
            margin: 0,
            background: "linear-gradient(135deg, #00ff88, #4a90e2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold"
          }}>
            🛡️ SENTRY DASHBOARD
          </h1>
          <p style={{ 
            fontSize: "1rem",
            opacity: 0.8, 
            margin: "0.5rem 0 0 0"
          }}>
            Review and classify flagged content
          </p>
        </motion.div>
    

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "1rem", 
            marginBottom: "2rem" 
          }}
        >
          {[
            { label: "Total Posts", value: stats.total, color: "#4a90e2", icon: "📊" },
            { label: "Explicit", value: stats.explicit, color: "#ff4444", icon: "🚫" },
            { label: "Safe", value: stats.safe, color: "#4caf50", icon: "✅" },
            { label: "Pending", value: stats.pending, color: "#ffa500", icon: "⏳" }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                {stat.icon}
              </div>
              <div style={{ 
                fontSize: "2rem", 
                fontWeight: "bold", 
                color: stat.color,
                marginBottom: "0.5rem"
              }}>
                {stat.value}
              </div>
              <div style={{ opacity: 0.8, fontSize: "0.9rem" }}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Top Pagination */}
        <PageInfo 
          currentPage={page}
          totalPages={totalPages}
          totalItems={posts.length}
          itemsPerPage={perPage}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        {/* Content */}
        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: "4rem", 
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <p style={{ fontSize: "1.2rem" }}>Loading flagged media...</p>
          </div>
        ) : currentPosts.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "4rem", 
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <p style={{ fontSize: "1.2rem" }}>No flagged posts remaining</p>
            <p style={{ opacity: 0.7 }}>Great job keeping the platform safe!</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {currentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PostCard post={post} onFeedback={sendFeedback} />
                </motion.div>
              ))}
            </motion.div>
            
            {/* Bottom Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
            <PageInfo 
              currentPage={page}
              totalPages={totalPages}
              totalItems={posts.length}
              itemsPerPage={perPage}
            />
          </>
        )}
      </div>
    </div>
  );
}