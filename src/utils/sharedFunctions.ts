import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export function copyPageLink(entity: string) {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast(`${entity} link copied!`, {
        "type": "info",
        "position": "top-center"
    });
}