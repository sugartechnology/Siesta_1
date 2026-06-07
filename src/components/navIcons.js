export const HomeIcon = ({ active = false, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9V20.5H5.5A1.5 1.5 0 0 1 4 19V10.5Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 20.5V14a2.5 2.5 0 0 1 2.5-2.5h0A2.5 2.5 0 0 1 14.5 14v6.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      opacity={active ? 1 : 0.85}
    />
  </svg>
);

export const CatalogIcon = ({ active = false, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    <rect x="13.5" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    <rect x="3.5" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    <rect
      x="13.5"
      y="13"
      width="7"
      height="7"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.75"
      opacity={active ? 1 : 0.85}
    />
  </svg>
);

export const DesignIcon = ({ active = false, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2.5l1.35 3.9 3.9 1.35-3.9 1.35L12 13.1l-1.35-3.9-3.9-1.35 3.9-1.35L12 2.5Z"
      fill="currentColor"
      opacity={active ? 1 : 0.9}
    />
    <path
      d="M18.2 14.2l.75 2.15 2.15.75-2.15.75-.75 2.15-.75-2.15-2.15-.75 2.15-.75.75-2.15Z"
      fill="currentColor"
      opacity={active ? 0.95 : 0.7}
    />
    <path
      d="M5.8 15.4l.55 1.55 1.55.55-1.55.55-.55 1.55-.55-1.55-1.55-.55 1.55-.55.55-1.55Z"
      fill="currentColor"
      opacity={active ? 0.85 : 0.55}
    />
    <circle cx="12" cy="18.5" r="1.1" fill="currentColor" opacity={active ? 0.8 : 0.45} />
  </svg>
);

export const CartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 7.5h13l-1.4 7.2a1.5 1.5 0 0 1-1.47 1.2H9.2a1.5 1.5 0 0 1-1.47-1.2L6 4.8H3.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9.5" cy="19.5" r="1.25" fill="currentColor" />
    <circle cx="16.5" cy="19.5" r="1.25" fill="currentColor" />
  </svg>
);

export const ProfileIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="12" cy="9.75" r="2.75" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M7 18.25c.95-2.35 2.9-3.75 5-3.75s4.05 1.4 5 3.75"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

export const MAIN_NAV_ITEMS = [
  {
    id: "home",
    path: "/home",
    match: (pathname) => pathname === "/home",
    Icon: HomeIcon,
    labelKey: "nav.home",
  },
  {
    id: "collections",
    path: "/collections",
    match: (pathname) =>
      ["/collections", "/catalog", "/subcategory", "/products"].some((route) =>
        pathname.startsWith(route)
      ),
    Icon: CatalogIcon,
    labelKey: "nav.collections",
  },
  {
    id: "projects",
    path: "/projects",
    match: (pathname) =>
      [
        "/projects",
        "/projects-list",
        "/projects-details",
        "/section-details",
        "/camera",
        "/photograph",
        "/products",
        "/room-type",
      ].some((route) => pathname.startsWith(route)),
    Icon: DesignIcon,
    labelKey: "nav.projects",
    shortLabelKey: "nav.projectsShort",
  },
];
