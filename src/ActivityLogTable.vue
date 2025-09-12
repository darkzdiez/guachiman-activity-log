<script setup>
import { reactive, onMounted } from 'vue'

const props = defineProps({
    log_name: {
        type: [String, Number],
        required: true
    },
    log_ref: {
        type: [String, Number],
        required: true
    }
})

const rows = reactive([])

const loadRows = () => {
    const url = new URL(
        $globalState.getBackendBaseUrl() +
            '/api/guachiman/activity-log/timeline/' +
            props.log_name +
            '/' +
            props.log_ref
    )
    httpRequest({
        url,
        method: 'GET',
        errors: []
    })
        .then((data) => {
            rows.push(...data.activities)
        })
        .catch((response) => {
            console.error(response)
        })
}

const changesFor = (line) => {
    const changes = line && line.properties && Array.isArray(line.properties.changes)
        ? line.properties.changes
        : []
    return changes
}

const isRelationDiff = (change) => {
    if (!change) return false
    const hasAdded = change.added && (Array.isArray(change.added.ids) || Array.isArray(change.added.labels))
    const hasRemoved = change.removed && (Array.isArray(change.removed.ids) || Array.isArray(change.removed.labels))
    const hasLabelArrays = Array.isArray(change.old_labels) || Array.isArray(change.new_labels)
    const hasArrayValues = Array.isArray(change.old_value) || Array.isArray(change.new_value)
    return !!(hasAdded || hasRemoved || hasLabelArrays || hasArrayValues)
}

const joinOrDash = (arr) => {
    if (Array.isArray(arr) && arr.length) return arr.join(', ')
    return '—'
}

const prettyValue = (v) => {
    if (v === null || v === undefined || v === '') return 'Nulo'
    if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
    return String(v)
}

onMounted(() => {
    loadRows()
})
</script>

<template>
    <div v-if="rows.length">
        <table class="table table--small">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Detalles</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(line, idx) in rows" :key="idx">
                    <td class="nowrap">{{ line.created_at_formatted }}</td>
                    <td>{{ line.causer?.fullname || '—' }}</td>
                    <td>
                        <template v-if="line.event === 'create'">
                            Registro Creado
                        </template>
                        <template v-else>
                            <ul class="details-list">
                                <li v-for="(change, cidx) in changesFor(line)" :key="cidx">
                                    <template v-if="isRelationDiff(change)">
                                        <strong>{{ change.label || change.field }}:</strong>
                                        <div>• Añadidos: <span class="muted">{{ joinOrDash(change.added?.labels || change.added?.ids) }}</span></div>
                                        <div>• Quitados: <span class="muted">{{ joinOrDash(change.removed?.labels || change.removed?.ids) }}</span></div>
                                        <div>• Antes: <span class="muted">{{ joinOrDash(change.old_labels || change.old_value) }}</span></div>
                                        <div>• Ahora: <span class="muted">{{ joinOrDash(change.new_labels || change.new_value) }}</span></div>
                                    </template>
                                    <template v-else>
                                        <strong>{{ change.label || change.field }}:</strong>
                                        <span class="muted">"{{ prettyValue(change.old_value) }}"</span>
                                        →
                                        <span class="muted">"{{ prettyValue(change.new_value) }}"</span>
                                    </template>
                                </li>
                            </ul>
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else class="no-activity">- Aún no hay actividad -</div>
</template>

<style lang="scss" scoped>
.activity-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;

    th, td {
        text-align: left;
        padding: 8px 10px;
        border-bottom: 1px solid #eee;
        vertical-align: top;
    }

    thead th {
        background: #f9f9f9;
        color: #333;
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 1;
    }
}

.nowrap {
    white-space: nowrap;
}

.details-list {
    margin: 0;
    padding-left: 18px;
}

.muted {
    color: #666;
}

.no-activity {
    color: #757575;
    font-style: italic;
}
</style>
