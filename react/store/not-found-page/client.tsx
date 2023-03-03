import type React from 'react';
import { useEffect } from 'react';

import useNostoDependencies from '../hooks/use-nosto-dependencies';

const NostoNotFoundPage: React.FC = () => {
  const { allDataFinished, isFirstSend, nostojs } = useNostoDependencies();

  useEffect(() => {
    if (!allDataFinished || !isFirstSend) {
      return;
    }

    nostojs((session) => {
      return session.viewNotFound();
    });
  }, [allDataFinished, nostojs, isFirstSend]);

  return null;
};

export default NostoNotFoundPage;
