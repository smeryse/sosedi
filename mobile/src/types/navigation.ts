export interface AppNavigation {
  navigate: (screen: string, params?: object) => void;
  replace: (screen: string, params?: object) => void;
  goBack: () => void;
}

export interface IdRoute {
  params?: {
    id?: string;
  };
}
