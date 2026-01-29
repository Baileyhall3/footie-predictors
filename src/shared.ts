import { reactive } from 'vue';

const mobileNavControls = reactive({
    isOpen: false,
    toggle: () => {
        mobileNavControls.isOpen = !mobileNavControls.isOpen;
    },
    close: () => {
        mobileNavControls.isOpen = false;
    }
});

export default mobileNavControls;


export function isAppLike() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari "Add to Home Screen"
    (window.navigator as any).standalone === true
  )
}

export function useNavigationMode() {
  const isMobile = window.matchMedia('(max-width: 1024px)').matches

  const appLike = isAppLike()

  return {
    showBottomNav: isMobile && appLike,
    useHamburger: isMobile && !appLike,
  }
}