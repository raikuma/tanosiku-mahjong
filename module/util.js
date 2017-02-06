deepEqual = function(arr1, arr2) {
    if (!Array.isArray(arr1)) {
        return arr1 == arr2;
    }
    if (arr1.length != arr2.length) return false;

    a = arr1.deepCopy();
    b = arr2.deepCopy();
    a.sort();
    b.sort();

    for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
    }

    return true;
}

Array.prototype.deepCopy = function() {
    let des = this.map(function(e) {
        return e;
    });
    return des;
};

Array.prototype.deepInclude = function(obj) {
    for (let i = 0; i < this.length; i++) {
        if (deepEqual(this[i], obj)) {
            return true;
        }
    }
    return false;
}

Array.prototype.deepIncludes = function(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (!this.deepInclude(arr[i])) {
            return false;
        }        
    }
    return true;
}

Array.prototype.remove = function(e) {
    this.splice(this.indexOf(e), 1);
}

Array.prototype.removes = function(arr) {
    for (let i = 0; i < arr.length; i++) {
        this.remove(arr[i]);
    }
}

Array.prototype.deepRemove = function(obj) {
    for (let i = 0; i < this.length; i++) {
        if (deepEqual(this[i], obj)) {
            this.remove(this[i]);
        }
    }
}

Array.prototype.giveTo = function(des, e) {
    this.remove(e);
    des.push(e);
}

Array.prototype.singlePush = function(e) {
    if (!this.deepInclude(e)) {
        this.push(e);
    }
}

Array.prototype.popPush = function(des) {
    let e = this.pop();
    des.push(e);
}