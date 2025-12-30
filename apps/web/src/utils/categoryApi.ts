import { apiGet } from './api';

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
  productCount: number;
  subCategories?: string[];
  attributes?: {
    name: string;
    type: "text" | "number" | "boolean" | "select";
    required: boolean;
    options?: string[];
  }[];
}

export interface CategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
  children: CategoryHierarchy[];
}

// Fetch all categories from the API
export const fetchCategories = async (): Promise<ICategory[]> => {
  try {
    const data = await apiGet<{ data: ICategory[] }>("/api/v1/market/categories");
    return data.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Organize categories into a hierarchical structure
export const organizeCategories = (categories: ICategory[]): CategoryHierarchy[] => {
  const categoryMap = new Map<string, CategoryHierarchy>();
  const rootCategories: CategoryHierarchy[] = [];

  // First pass: create all category objects
  categories.forEach(category => {
    categoryMap.set(category._id, {
      id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      productCount: category.productCount,
      children: []
    });
  });

  // Second pass: establish parent-child relationships
  categories.forEach(category => {
    const categoryNode = categoryMap.get(category._id);
    if (!categoryNode) return;

    if (category.parentId) {
      // This is a child category
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(categoryNode);
      }
    } else {
      // This is a root category
      rootCategories.push(categoryNode);
    }
  });

  return rootCategories;
};

// Get categories organized by level (for vendor form)
export const getCategoriesByLevel = (categories: ICategory[]) => {
  const level1: ICategory[] = [];
  const level2: ICategory[] = [];
  const level3: ICategory[] = [];

  categories.forEach(category => {
    if (!category.parentId) {
      level1.push(category);
    } else {
      // Check if parent is level 1 or level 2
      const parent = categories.find(c => c._id === category.parentId);
      if (parent && !parent.parentId) {
        level2.push(category);
      } else if (parent && parent.parentId) {
        level3.push(category);
      }
    }
  });

  return { level1, level2, level3 };
};

// Get category path (e.g., "Electronics > Phones & Accessories > Smartphones")
export const getCategoryPath = (category: ICategory, categories: ICategory[]): string => {
  const path: string[] = [category.name];
  let current = category;

  while (current.parentId) {
    const parent = categories.find(c => c._id === current.parentId);
    if (parent) {
      path.unshift(parent.name);
      current = parent;
    } else {
      break;
    }
  }

  return path.join(' > ');
};

// Get all subcategories of a category (recursive)
export const getAllSubcategories = (categoryId: string, categories: ICategory[]): ICategory[] => {
  const subcategories: ICategory[] = [];

  const findSubcategories = (parentId: string) => {
    const children = categories.filter(c => c.parentId === parentId);
    children.forEach(child => {
      subcategories.push(child);
      findSubcategories(child._id);
    });
  };

  findSubcategories(categoryId);
  return subcategories;
};

// Get category options for vendor form (flattened with paths)
export const getCategoryOptionsForVendor = (categories: ICategory[]) => {
  const options: Array<{ value: string; label: string; path: string; level: number }> = [];

  categories.forEach(category => {
    if (!category.parentId) {
      // Level 1 (Departments)
      options.push({
        value: category.slug,
        label: category.name,
        path: category.name,
        level: 1
      });

      // Find level 2 categories
      const level2Categories = categories.filter(c => c.parentId === category._id);
      level2Categories.forEach(level2Cat => {
        options.push({
          value: level2Cat.slug,
          label: level2Cat.name,
          path: `${category.name} > ${level2Cat.name}`,
          level: 2
        });

        // Find level 3 categories
        const level3Categories = categories.filter(c => c.parentId === level2Cat._id);
        level3Categories.forEach(level3Cat => {
          options.push({
            value: level3Cat.slug,
            label: level3Cat.name,
            path: `${category.name} > ${level2Cat.name} > ${level3Cat.name}`,
            level: 3
          });
        });
      });
    }
  });

  return options.sort((a, b) => {
    // Sort by level first, then by path
    if (a.level !== b.level) return a.level - b.level;
    return a.path.localeCompare(b.path);
  });
};

// Get category by slug
export const getCategoryBySlug = (slug: string, categories: ICategory[]): ICategory | undefined => {
  return categories.find(c => c.slug === slug);
};

// Get category breadcrumb
export const getCategoryBreadcrumb = (categorySlug: string, categories: ICategory[]) => {
  const category = getCategoryBySlug(categorySlug, categories);
  if (!category) return [];

  const breadcrumb: Array<{ name: string; slug: string }> = [];
  let current = category;

  while (current) {
    breadcrumb.unshift({ name: current.name, slug: current.slug });
    if (current.parentId) {
      current = categories.find(c => c._id === current.parentId) || current;
    } else {
      break;
    }
  }

  return breadcrumb;
}; 