import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { fetchGroupsHierarchy } from "../services/groupService";
import PropTypes from "prop-types";
import { div } from "motion/react-client";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * CategoryFilter Component
 * Displays a hierarchical tree of product categories with expand/collapse functionality
 */
export default function CategoryFilter({ onSelectCategory, selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [seeCategory, setSeeCategory] = useState(true);

  const handleSeeCategory = () => {
    setSeeCategory(!seeCategory);
  };


  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchGroupsHierarchy();
        setCategories(data);
        // Auto-expand all root categories
        const rootIds = new Set(data.map(cat => cat.id));
        setExpandedCategories(rootIds);
        setError(null);
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("No se pudieron cargar las categorías");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryClick = (category) => {
    onSelectCategory(category);
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory?.id === category.id;

    return (
      <div key={category.id} className="select-none">
        <motion.div
          className={`
            flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer
            transition-colors duration-200
            ${isSelected 
              ? 'bg-primary text-primary-content font-medium' 
              : 'hover:bg-base-300 text-base-content'
            }
          `}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          onClick={() => handleCategoryClick(category)}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </button>
          )}
          
          {!hasChildren && <div className="w-8" />}
          
          <span className="flex-1 text-sm font-light tracking-wide">
            {category.group_name}
          </span>
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {category.children.map(child => renderCategory(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="md:w-64 w-72 bg-base-200 rounded-lg p-4 shadow-lg h-fit sticky top-4">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-light tracking-widest text-base-content mb-2">
          CATEGORÍAS
        </h2>
        <button onClick={handleSeeCategory} className="btn btn-xs btn-icon tooltip" data-tip="Ver Categorias">{seeCategory ? (<ChevronUp className="w-4 h-4" />) : (<ChevronDown className="w-4 h-4" />)}</button>
      </div>
        <div className="w-12 h-px bg-primary mb-2"></div>

      {/* All Products Button */}
      {seeCategory && (
        <div>

      <motion.button
        onClick={() => onSelectCategory(null)}
        className={`
          w-full py-2 px-3 rounded-lg mb-3 text-sm font-light tracking-wide
          transition-colors duration-200
          ${!selectedCategory 
            ? 'bg-primary text-primary-content font-medium' 
            : 'bg-base-300 hover:bg-base-300/70 text-base-content'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        TODOS LOS PRODUCTOS
      </motion.button>

      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-md text-primary"></span>
        </div>
      )}

      
      {error && (
        <div className="alert alert-error alert-sm">
          <span className="text-xs">{error}</span>
        </div>
      )}

    
      {!loading && !error && (
        <div className="space-y-1">
          {categories.map(category => renderCategory(category))}
        </div>
      )}
      </div>
      )}
    </div>
  );
}

CategoryFilter.propTypes = {
  onSelectCategory: PropTypes.func.isRequired,
  selectedCategory: PropTypes.object,
};
