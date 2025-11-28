import Timeline from './Timeline.vue'
import Timeline2 from './Timeline2.vue'
import ShowModal from './ModalShow.vue'
import GuachimanActivityLogTimeline from './Timeline.vue'
import GuachimanActivityLogTable from './ActivityLogTable.vue'

const showModalActivityLogTimeline = (logName, logRef, format = 'timeline') => {
    let modalClient = awesomeModal.open({
        type: 'component',
        component: ShowModal,
        log_name: logName,
        log_ref: logRef,
        format
    })
    modalClient.promise.then((response) => {})
    modalClient.promise.catch((response) => {})
}

export {
    showModalActivityLogTimeline,
    Timeline,
    Timeline2,
    ShowModal,
    GuachimanActivityLogTimeline,
    GuachimanActivityLogTable
}
