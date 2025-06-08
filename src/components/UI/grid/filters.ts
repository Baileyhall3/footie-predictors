import { reactive } from "vue"

export type Operator = '=' | '>' | '<' | '!='

export interface Query {
    field: string,
    queryValue: any,
    operator?: Operator
}

export type GridFilterState = {
    activeFilters?: Query[],
    apply: (filterQuery: Query) => void,
    parse: (filterQuery: Query) => void,
    clear: (field: string) => void,
    clearAll: () => void
}

export const gridFilterState = reactive<GridFilterState>({
    activeFilters: [],
    apply: applyFilter,
    parse: parseFilterQuery,
    clear: clearFilterForField,
    clearAll: clearAllFilters,
});

async function applyFilter(filterQuery: Query) {
    gridFilterState.activeFilters?.push(filterQuery);
    console.log('filters applied')
}

async function parseFilterQuery(filterQuery: Query) {
    console.log('parsed filter string ', filterQuery)
}

async function clearFilterForField(field: string) {
    gridFilterState.activeFilters = gridFilterState.activeFilters?.filter(x => x.field !== field);
}

async function clearAllFilters() {
    console.log('all filters have been cleared')
}
