import type React from 'react';
import { useEffect } from 'react';

import useNostoDependencies from '../hooks/use-nosto-dependencies';

const NostoFrontPage: React.FC = () => {
  const { allDataFinished, isFirstSend, nostojs } = useNostoDependencies();

  useEffect(() => {
    if (!allDataFinished || !isFirstSend) {
      return;
    }

    nostojs((session) => {
      return session.viewFrontPage();
    });
  }, [allDataFinished, isFirstSend, nostojs]);

  return null;
};

export default NostoFrontPage;
