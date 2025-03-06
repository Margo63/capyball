class Manager {

    getAction(dt, labels) {
        this.labels = labels

        function execute(dt, title) {
            const action = dt[title]
            if (typeof action.exec == "function") {
                action.exec(Manager, dt.state)
                return execute(dt, action.next)
            }
            if (typeof action.condition == "function") {
                const cond = action.condition(Manager, dt.state)
                if (cond)
                    return execute(dt, action.trueCond)
                return execute(dt, action.falseCond)
            }
            if (typeof action.command == "function") {
                return action.command(Manager, dt.state)
            }
            throw new Error(`Unexpected node in DT: ${title}`)
        }


        return execute(dt, "root")
    }

    getVisible(fl){
        return fl in this.labels.all_labels_name
    }

    getDistance(fl){
        // TODO create hash map with flags
        let index = this.labels.constant_labels.findIndex(function (el){
            return el.fl === fl
        });
        return this.labels.constant_labels[index].distance
    }

    getAngle(fl){
        let index = this.labels.constant_labels.findIndex(function (el){
            return el.fl === fl
        });
        return this.labels.constant_labels[index].angle
    }
}
module.exports = Manager