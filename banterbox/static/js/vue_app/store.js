const createStore = () => {
    return {
        demo : true,
        user: {
            id: null,
            authenticated: false,
            profile_loaded: false,
            email: null,
            icon: null,
            first_name: null,
            last_name: null,
            username: null,
            is_admin : false,

            get full_name() {
                if (!this.first_name || !this.last_name) {
                    return null
                }
                return `${this.first_name} ${this.last_name}`
            }
        },
        units: {
            current_unit: {},
            hovered: null,
            units: [],
        },
        alerts: {
            alerts: [],

            /**
             * Adds an alert
             * @param message
             * @param type
             * @param duration : if this is set to a falsey value, it is treated as a non dismissible alert
             */
            addAlert({message, type = 'info', duration = 2500}){

                const valid_types = ['info', 'warning', 'danger', 'success']
                if (valid_types.indexOf(type) === -1) {
                    type = 'info'
                }

                const alert = {message, type, duration}
                this.alerts.push(alert)


                if (duration) {
                    setTimeout(() => {
                        const index = this.alerts.indexOf(alert)
                        this.alerts.splice(index, 1)
                    }, duration)
                }
            },

            /**
             * Dismisses an alert if it's possible to do so.
             * @param index
             */
            dismissAlert(index){
                if (this.alerts[index].duration) {
                    this.alerts.splice(index, 1)
                }
            }
        },
    }
}


export const store = createStore()
store.reset = () => Object.assign(store, createStore())

