import React from 'react';
import { useRuntime } from 'vtex.render-runtime';

export type SearchPageProps = {
  searchType?: 'search' | 'category';
};

const categoryTypes = ['department', 'category', 'subcategory'];
const NostoSearchConditional: React.FC<SearchPageProps> = ({ searchType, children }) => {
  const {
    route: {
      pageContext: { type },
    },
    query,
  } = useRuntime();

  if (!searchType) {
    return <>{children}</>;
  }

  const isCategoryPage = categoryTypes.includes(type) || query?.map === 'productClusterIds';

  if (searchType === 'category' && isCategoryPage) {
    return <>{children}</>;
  }

  if (searchType === 'search' && !isCategoryPage) {
    return <>{children}</>;
  }

  return null;
};

export default NostoSearchConditional;
