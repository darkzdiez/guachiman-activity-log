<template>
    <div class="modal">
        <div class="modal__head">
            <h1 class="m-0">Historial de Actividad</h1>
        </div>
        <div class="modal__body px-20">
            <GuachimanActivityLogTimeline
                :log_name="props.data.rawData.log_name"
                :log_ref="props.data.rawData.log_ref"
            ></GuachimanActivityLogTimeline>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import GuachimanActivityLogTimeline from './Timeline.vue'

const props = defineProps({
    data: {
        type: Object,
        required: true
    }
})

const close = () => {
    props.data.callback.reject('Close on overlay click')
}

const formSubmit = () => {
    let form_data = new FormData()
    form_data.append('pedido_id', props.data.rawData.pedido.id)
    form_data.append('quantity', props.data.rawData.pedido.quantity)
    form_data.append('unit', props.data.rawData.pedido.unit)
    form_data.append('lote', props.data.rawData.pedido.lote)
    form_data.append('client_note', props.data.rawData.pedido.client_note)

    let url = new URL($globalState.getBackendBaseUrl() + '/api/turno/editar-pedido')

    errors.splice(0, errors.length)
    httpRequest({
        url: url,
        method: 'POST',
        data: form_data,
        loading: 'Editando pedido...',
        errors: []
    })
        .then((data) => {
            successMessages.push('Pedido editado correctamente')
            props.data.callback.resolve(data)
        })
        .catch((response) => {
            errors.splice(0, errors.length)
            if (response.status == 422) {
                response.bodyData.then((data) => {
                    Object.keys(data.errors).map((key) => {
                        data.errors[key].forEach((error) => {
                            errors.push(error)
                        })
                    })
                })
                // console.log(errors)
                return false
            }
        })
}
</script>

<style lang="scss" scoped>
.modal {
    background-color: #fff;
    position: absolute;
    // top: 15px;
    // bottom: 15px;
    left: 15px;
    right: 15px;
    box-sizing: border-box;
    overflow: auto;
    display: flex;
    flex-direction: column;
    max-width: 400px;
    margin: auto;
    max-height: calc(100vh - 30px);
    &__head {
        position: sticky;
        top: 0;
        background: #fff;
        padding: 10px;
        box-sizing: border-box;
    }
    &__body {
        padding: 10px;
        padding-top: 0;
        box-sizing: border-box;
        flex-grow: 1;
    }
}
.floating-buttons {
    display: flex;
    padding: 25px;
    gap: 15px;
}
</style>
