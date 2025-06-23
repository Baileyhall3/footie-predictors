import { GridColProps } from "./GridCol.vue";

export function registerColumns(vNodes: any): GridColProps[] {
    console.log('nodes: ', vNodes)
    return vNodes.map((vnode: any) => {
        const props = vnode.props || {};
        const slots = vnode.children || {};
        return {
            ...props,
            sortable: props.sortable !== undefined && props.sortable !== false && props.sortable !== 'false',
            editable: props.editable !== undefined && props.editable !== false && props.editable !== 'false',
            disableFilter: props.disableFilter !== undefined && props.disableFilter !== false && props.disableFilter !== 'false',
            headerSlot: slots.headercontent,
        };
    });
}
