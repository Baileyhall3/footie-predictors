import { GridColProps } from "./GridCol.vue";

export function registerColumns(vNodes: any): GridColProps[] {
    return vNodes.map((x: any) => {
        const props = x.props || {};
        return {
            ...props,
            sortable: props.sortable !== undefined && props.sortable !== false && props.sortable !== 'false',
            editable: props.editable !== undefined && props.editable !== false && props.editable !== 'false',
            disableFilter: props.disableFilter !== undefined && props.disableFilter !== false && props.disableFilter !== 'false',
        };
    });
}
