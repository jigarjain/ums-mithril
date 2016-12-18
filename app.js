'use strict';

if (!window.indexedDB) {
    window.alert('Your browser doesn\'t support a stable version of IndexedDB. Such and such feature will not be available.');
}

const App = {};


App.DB = {
    name: 'ums',

    version: 2,

    /**
     * Initializes the IndexedDB for our application.
     * For the first load, it populates it with our
     * seed data. For subsequent loads, it does nothing
     *
     * @param  {Object} seed
     * @return {Promise}
     */
    init: (seed) => {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(App.DB.name, App.DB.version);

            req.onerror = (event) => {
                return reject('IndexedDB connection failed');
            };

            req.onsuccess = (event) => {
                return resolve(event.target.result);
            };

            req.onupgradeneeded = (event) => {
                const db = event.target.result;
                const trans = event.target.transaction;

                db.createObjectStore('users', {keyPath: 'id'});
                db.createObjectStore('groups', {keyPath: 'id'});

                const userTrans = trans.objectStore('users');
                const groupTrans = trans.objectStore('groups');

                for (let i in seed.users) { // eslint-disable-line prefer-const
                    userTrans.add(seed.users[i]);
                }

                for (let i in seed.groups) { // eslint-disable-line prefer-const
                    groupTrans.add(seed.groups[i]);
                }

                return resolve(db);
            };
        })
        .then((db) => {
            db.close();
        });
    },


    /**
     * Returns a promise which resolves to IDBDatabase
     * object.
     * Note - Make sure to call close for closing the IDBDatabase
     *
     * @return {Promise} On resolve, will give IDBDatabase object
     */
    open: () => {
        return new Promise((resolve, reject) => {
            const req = window.indexedDB.open(App.DB.name, App.DB.version);

            req.onerror = (event) => {
                return reject('IndexedDB connection failed');
            };

            req.onsuccess = (event) => {
                return resolve(event.target.result);
            };
        });
    },

    /**
     * Closes the DB connection for the given IDBDatabase object
     *
     * @param  {Object} db
     * @return {void}
     */
    close: (db) => {
        db.close();
    }
};


/**
 * Represents the Group model
 *
 * @param {Object} data
 * @return {Object} Instance of App.Group model
 */
App.Group = function (data) {
    data = data || {};

    ['id', 'name', 'description'].forEach(prop => {
        this[prop] = m.prop(data[prop]);
    });
};


/**
 * Returns all the groups from the API
 *
 * @return {Function} m.prop getter/setter func
 */
App.Group.getAll = function () {
    return m.prop(
        App.DB.open()
        .then(db => {
            return new Promise((resolve, reject) => {
                const query = db.transaction('groups').objectStore('groups').getAll();

                query.onsuccess = (event) => {
                    const groups = event.target.result.map(g => {
                        return new App.Group(g);
                    });

                    App.DB.close(db);
                    resolve(groups);
                };

                query.onerror = (event) => {
                    reject('DB query failed');
                };
            });
        })
    );
};


/**
 * For a given group id, it returns the particular
 * group object from the API
 *
 * @param  {Number} id Group id
 * @return {Function} m.prop getter/setter func
 */
App.Group.getById = function (id) {
    return m.prop(
        App.DB.open()
        .then(db => {
            return new Promise((resolve, reject) => {
                const query = db.transaction('groups').objectStore('groups').get(id);

                query.onsuccess = (event) => {
                    App.DB.close(db);
                    resolve(new App.Group(event.target.result));
                };

                query.onerror = () => {
                    reject('DB query failed');
                };
            });
        })
    );
};


/**
 * Saves the updated group
 *
 * @param  {Object} group
 * @return {Function} m.prop getter/setter func
 */
App.Group.save = function (group) {
    const grp = {};

    for (let key in group) { // eslint-disable-line prefer-const
        grp[key] = group[key]();
    }

    return m.prop(
        App.DB.open()
        .then(db => {
            return new Promise((resolve, reject) => {
                const query = db.transaction('groups', 'readwrite').objectStore('groups').put(grp);

                query.onsuccess = () => {
                    App.DB.close(db);
                    resolve(true);
                };

                query.onerror = () => {
                    reject('DB query failed');
                };
            });
        })
    );
};


/**
 * Represents a User model
 *
 * @param {Object} user
 * @return {Object} Instance of App.User model
 */
App.User = function (user) {
    user = user || {};

    ['id', 'name', 'gender', 'role', 'group_ids'].forEach(prop => {
        this[prop] = m.prop(user[prop]);
    });
};


/**
 * Returns all the users from the API
 *
 * @return {Function} m.prop getter/setter func
 */
App.User.getAll = function () {
    return m.prop(
        App.DB.open()
        .then(db => {
            return new Promise((resolve, reject) => {
                const query = db.transaction('users').objectStore('users').getAll();

                query.onsuccess = (event) => {
                    const users = event.target.result.map(u => {
                        return new App.User(u);
                    });

                    App.DB.close(db);
                    resolve(users);
                };

                query.onerror = (event) => {
                    reject('DB query failed');
                };
            });
        })
    );
};


/**
 * For a given user id, it returns the particular
 * user object from the API
 *
 * @param  {Number} id User id
 * @return {Function} m.prop getter/setter func
 */
App.User.getById = function (id) {
    return m.prop(
        App.DB.open()
        .then(db => {
            return new Promise((resolve, reject) => {
                const query = db.transaction('users').objectStore('users').get(id);

                query.onsuccess = (event) => {
                    App.DB.close(db);
                    resolve(new App.User(event.target.result));
                };

                query.onerror = () => {
                    reject('DB query failed');
                };
            });
        })
    );
};


/**
 * Saves the updated user info
 *
 * @param  {Object} user
 * @return {Function} m.prop getter/setter func
 */
App.User.save = function (user) {
    const usr = {};

    for (let key in user) { // eslint-disable-line prefer-const
        usr[key] = user[key]();
    }

    return m.prop(
        App.DB.open()
        .then(db => {
            return new Promise((resolve, reject) => {
                const query = db.transaction('users', 'readwrite').objectStore('users').put(usr);

                query.onsuccess = () => {
                    App.DB.close(db);
                    resolve(true);
                };

                query.onerror = () => {
                    reject('DB query failed');
                };
            });
        })
    );
};


// Mounted on `/dashboard`
App.dashboard = {
    controller: function () {
        this.users = App.User.getAll();
        this.groups = App.Group.getAll();

        this.users.then(m.redraw);
        this.groups.then(m.redraw);
    },


    view: function (ctrl) {
        const users = ctrl.users() || [];
        const groups = ctrl.groups() || [];

        const userRows = [];
        const groupRows = [];

        userRows.push(m('tr',
            [
                m('th', 'Id'),
                m('th', 'Name'),
                m('th', 'Gender'),
                m('th', 'Role'),
                m('th', 'Groups'),
                m('th', 'Action')
            ]
        ));

        users.forEach(usr => {
            userRows.push(m('tr',
                [
                    m('td', usr.id()),
                    m('td', usr.name()),
                    m('td', usr.gender()),
                    m('td', usr.role()),
                    m('td', usr.group_ids().length),
                    m('td', [
                        m(`a[href="/users/${usr.id()}/edit"]`, {config: m.route}, 'Edit')
                    ])
                ]
            ));
        });

        groupRows.push(m('tr',
            [
                m('th', 'Id'),
                m('th', 'Name'),
                m('th', 'Description'),
                m('th', 'Members'),
                m('th', 'Action')
            ]
        ));

        groups.forEach(grp => {
            grp.members = 0;

            users.forEach(u => {
                if (u.group_ids().indexOf(grp.id()) > -1) {
                    grp.members = grp.members + 1;

                    return false;
                }
            });

            groupRows.push(m('tr',
                [
                    m('td', grp.id()),
                    m('td', grp.name()),
                    m('td', grp.description()),
                    m('td', grp.members),
                    m('td', [
                        m(`a[href="/groups/${grp.id()}/edit"]`, {config: m.route}, 'Edit')
                    ])
                ]
            ));
        });

        return [
            m('h2', 'All Users'),
            m('br'),
            m('table', userRows),
            m('br'),
            m('h2', 'All Groups'),
            m('br'),
            m('table', groupRows)
        ];
    }
};


// Mounted on `/users/:id/edit`
App.editUser = {
    controller: function () {
        this.user = App.User.getById(parseInt(m.route.param('id'), 10));
        this.groups = App.Group.getAll();

        this.user.then(m.redraw);
        this.groups.then(m.redraw);

        this.onsubmit = (usr) => {
            App.User.save(usr).then(() => {
                m.route('/dashboard');
            })
            .catch((err) => {
                console.log(err);
            });
        };
    },


    view: function (ctrl) {
        const user = ctrl.user() || {};
        const groups = ctrl.groups() || [];

        const groupList = groups.map(g => {
            return m('div', [
                m('label', [
                    m('input[type="checkbox"]', {
                        value: g.id(),
                        name: 'groups',
                        onclick: () => {
                            const currentGrps = user.group_ids();
                            const currIndex = user.group_ids().indexOf(g.id());

                            if (currIndex > -1) {
                                currentGrps.splice(currIndex, 1);
                            } else {
                                currentGrps.push(g.id());
                            }

                            user.group_ids(currentGrps);
                        },
                        checked: user.group_ids && user.group_ids().indexOf(g.id()) > -1
                    })
                ], g.name())
            ]);
        });

        return [
            m('h2', 'Edit User'),
            m('form',
                {
                    onsubmit: () => {
                        ctrl.onsubmit(user);

                        return false;
                    }
                },
                [
                    m('table', [
                        m('tr', [
                            m('th', 'Name'),
                            m('td', [
                                m('input', {
                                    onchange: m.withAttr('value', user.name),
                                    value: user.name ? user.name() : ''
                                })
                            ])
                        ]),
                        m('tr', [
                            m('th', 'Gender'),
                            m('td', [
                                m('select',
                                    {
                                        onchange: m.withAttr('value', user.gender),
                                        value: user.gender ? user.gender() : ''
                                    },
                                    [
                                        m('option', {value: 'M'}, 'Male'),
                                        m('option', {value: 'F'}, 'Female')
                                    ]
                                )
                            ])
                        ]),
                        m('tr', [
                            m('th', 'Role'),
                            m('td', [
                                m('input', {
                                    onchange: m.withAttr('value', user.role),
                                    value: user.role ? user.role() : ''
                                })
                            ])
                        ]),
                        m('tr', [
                            m('th', 'Groups'),
                            m('td', [groupList])
                        ]),
                        m('tr', [
                            m('th'),
                            m('td', [
                                m('button[type=submit]', 'Update')
                            ])
                        ])
                    ])
                ]
            )
        ];
    }
};


// Mounted on `/groups/:id/edit`
App.editGroup = {
    controller: function () {
        this.group = App.Group.getById(parseInt(m.route.param('id'), 10));

        this.group.then(m.redraw);

        this.onsubmit = (grp) => {
            App.Group.save(grp).then(() => {
                m.route('/dashboard');
            })
            .catch((err) => {
                console.log(err);
            });
        };
    },


    view: function (ctrl) {
        const group = ctrl.group() || {};

        return [
            m('h2', 'Edit Group'),
            m('form',
                {
                    onsubmit: () => {
                        ctrl.onsubmit(group);

                        return false;
                    }
                },
                [
                    m('table', [
                        m('tr', [
                            m('th', 'Name'),
                            m('td', [
                                m('input', {
                                    onchange: m.withAttr('value', group.name),
                                    value: group.name ? group.name() : ''
                                })
                            ])
                        ]),
                        m('tr', [
                            m('th', 'Description'),
                            m('td', [
                                m('textarea', {
                                    onchange: m.withAttr('value', group.description),
                                    value: group.description ? group.description() : ''
                                })
                            ])
                        ]),
                        m('tr', [
                            m('th'),
                            m('td', [
                                m('button[type=submit]', 'Update')
                            ])
                        ])
                    ])
                ]
            )
        ];
    }
};


App.init = function () {
    window.fetch('data/seed.json')
        .then(res => res.json())
        .then(App.DB.init)
        .then(() => {
            m.route(document.getElementById('app'), '/dashboard', {
                '/dashboard': App.dashboard,
                '/users/:id/edit': App.editUser,
                '/groups/:id/edit': App.editGroup
            });
        })
        .catch((err) => {
            console.log('Error', err);
        });
};
