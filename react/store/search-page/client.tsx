import type React from 'react';
import { useEffect, useState } from 'react';
import { useRuntime } from 'vtex.render-runtime';
import type { NavigationItem, SearchQuery } from 'vtex.search-page-context/SearchPageContext';
import { useSearchPage } from 'vtex.search-page-context/SearchPageContext';

import useNostoDependencies from '../hooks/use-nosto-dependencies';

export type SearchPageProps = {
  searchType?: 'search' | 'category' | 'brand' | 'collection';
  searchTerm?: string;
  searchQuery?: SearchQuery;
};

const defaultBreadcrumb: NavigationItem[] = [];
const NostoSearchPage: React.FC<SearchPageProps> = (props) => {
  const { searchType, searchTerm, searchQuery: searchQueryProps } = props;
  const {
    route: {
      pageContext: { type, id },
      params: { brand },
    },
    query,
  } = useRuntime();

  const { searchQuery: searchQueryPage } = useSearchPage();
  const searchQuery = searchQueryProps ?? searchQueryPage;
  const breadcrumb: NavigationItem[] =
    searchQuery?.data?.productSearch?.breadcrumb ?? searchQuery?.data?.facets?.breadcrumb ?? defaultBreadcrumb;

  const { allDataFinished, isFirstSend, nostojs } = useNostoDependencies();

  const [localTerm, setLocalTerm] = useState('');
  let term = searchTerm ?? decodeURI(id || '');

  let searchMode: SearchPageProps['searchType'] = searchType;

  if (!searchMode) {
    if (type === 'search') {
      if (query?.map === 'productClusterIds' && parseInt(term, 10).toString() === term) {
        searchMode = 'collection';
      } else {
        searchMode = 'search';
      }
    } else if (['department', 'category', 'subcategory'].includes(type)) {
      searchMode = 'category';
    } else if (type === 'brand') {
      searchMode = 'search';
      term = brand;
    } else {
      console.warn('[NOSTO] unknown page type', type);
    }
  }

  // general/brand search
  useEffect(() => {
    if (!allDataFinished || searchMode !== 'search' || term === localTerm) {
      return;
    }

    setLocalTerm(term);
    nostojs((session) => {
      return session.viewSearch(term);
    });
  }, [allDataFinished, nostojs, term, localTerm, searchMode]);

  // category, always start with /
  useEffect(() => {
    if (!allDataFinished || !isFirstSend || searchMode !== 'category' || !breadcrumb.length) {
      return;
    }

    nostojs((session) => {
      const category = `/${breadcrumb.map((item) => item.name).join('/')}`;

      return session.viewCategory(category);
    });
  }, [allDataFinished, nostojs, searchMode, breadcrumb, isFirstSend]);

  // collections are technically just another category
  useEffect(() => {
    if (!allDataFinished || !isFirstSend || searchMode !== 'collection' || term === localTerm) {
      return;
    }

    setLocalTerm(term);
    nostojs((session) => {
      const category = `/VTEX Collection/${term}`;

      return session.viewCategory(category);
    });
  }, [allDataFinished, nostojs, searchMode, isFirstSend, term, localTerm]);

  return null;
};

export default NostoSearchPage;
