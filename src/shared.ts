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
