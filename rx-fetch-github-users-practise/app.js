const {Observable} = Rx;
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const URL = `https://api.github.com/users?since=`
const UPDATE_FIRST_USER = 'UPDATE_FIRST_USER';
const UPDATE_SECOND_USER = 'UPDATE_SECOND_USER';
const UPDATE_THIRD_USER = 'UPDATE_THIRD_USER';
const UPDATE_ALL = 'UPDATE_ALL'
const close1$ = Observable.fromEvent($('.close1'), 'click')
const close2$ = Observable.fromEvent($('.close2'), 'click')
const close3$ = Observable.fromEvent($('.close3'), 'click')
const refresh$ = Observable.fromEvent($('.refresh'), 'click')
const img1 = $('.img1');
const img2 = $('.img2');
const img3 = $('.img3');
const text1 = $('.text1');
const text2 = $('.text2');
const text3 = $('.text3');
const generateRandomValue = max => min => Math.floor(Math.random() * (max - min) + min)
const users = (async () => {
    const json = await fetch(URL);
    return json;
})();
console.log('​users -> users', users);

console.log('​', );
const users$ = refresh$.map(() => {
    const randomNum = Math.floor(Math.random() * 1000);
    return URL + randomNum;
})
.startWith(URL+100)
.switchMap(x => fetch(x))
.switchMap(x => x.json())

const random3$ = users$.map(x => {
    const {length} = x
    return {
        payload: [
            x[generateRandomValue(length - 1)(0)],
            x[generateRandomValue(length - 1)(0)],
            x[generateRandomValue(length - 1)(0)]
        ],
        action: UPDATE_ALL
    }
})

const closeClicks$ = Observable.merge(
    close1$.mapTo(UPDATE_FIRST_USER),
    close2$.mapTo(UPDATE_SECOND_USER),
    close3$.mapTo(UPDATE_THIRD_USER),
).do(console.log)
const updateSingle$ = Observable.combineLatest(users$, closeClicks$, (users, action) => {
    switch(action) {
        case UPDATE_FIRST_USER: 
            return {
                action,
                payload: users[generateRandomValue(users.length - 1)(0)]
            }
            break;
        case UPDATE_SECOND_USER: 
            return {
                action,
                payload: users[generateRandomValue(users.length - 1)(0)]
            }
            break;
        case UPDATE_THIRD_USER: 
            return {
                action,
                payload: users[generateRandomValue(users.length - 1)(0)]
            }
            break;
    }
}).do(console.log)
const updateAll = ([obj1, obj2, obj3]) => {
    img1.src = obj1.avatar_url;
    text1.innerHTML = obj1.login
    img2.src = obj2.avatar_url;
    text2.innerHTML = obj2.login
    img3.src = obj3.avatar_url;
    text3.innerHTML = obj3.login
}
const updateSingle = (img, text) => ({ avatar_url, login }) => {
    img.src = avatar_url;
    text.innerHTML = login
}

const result$ = Observable.merge(random3$, updateSingle$)
    .subscribe(x => {
        switch(x.action) {
            case UPDATE_ALL: {
                updateAll(x.payload);
                break;
            }
            case UPDATE_FIRST_USER: {
                updateSingle(img1, text1)(x.payload)
                break;
            }
            case UPDATE_SECOND_USER: {
                updateSingle(img2, text2)(x.payload)
                
                break;
            }
            case UPDATE_THIRD_USER: {
                updateSingle(img3, text3)(x.payload)

                break;
            }
        }
    })

    Observable.fromEvent(document, 'keypress').pluck('key').do(key => {
        switch(key) {
            case 'a': {
                const event = new Event('click');
                $('.close1').dispatchEvent(event);
                break;
            }
            case 's': {
                const event = new Event('click');
                $('.close2').dispatchEvent(event);
                break;
            }
            case 'd': {
                const event = new Event('click');
                $('.close3').dispatchEvent(event);
                break;
            }
            case 'r': {
                const event = new Event('click');
                $('.refresh').dispatchEvent(event);
                break;
            }
        }
    }).subscribe();