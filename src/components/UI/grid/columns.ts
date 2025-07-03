import type { GridColProps } from "./GridCol.vue";

export function registerColumns(vNodes: any): GridColProps[] {
    console.log('nodes: ', vNodes)
    const fields = new Set<string>();
    const columns: GridColProps[] = [];

    for (const vnode of vNodes) {
        const props = vnode.props || {};
        const slots = vnode.children || {};

        if (!props.field) {
            console.warn("GridCol is missing a 'field' prop and will be ignored.");
            continue;
        }

        if (fields.has(props.field)) {
            console.warn(`Duplicate GridCol field "${props.field}" detected. This column will be ignored.`);
            continue;
        }

        fields.add(props.field);

        columns.push({
            ...props,
            sortable: props.sortable !== undefined && props.sortable !== false && props.sortable !== 'false',
            editable: props.editable !== undefined && props.editable !== false && props.editable !== 'false',
            disableFilter: props.disableFilter !== undefined && props.disableFilter !== false && props.disableFilter !== 'false',
            headerSlot: slots.headercontent,
            component: vnode,
        });
    }

    return columns;
}
