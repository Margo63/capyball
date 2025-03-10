## seeDatasFormat

### let all_labels = [] // все метки (названия)

```javascript
[
    'flt', 'fglb', 'gl',
    'fglt', 'fplc', 'fplt',
    'ftl30', 'ftl40', 'ftl50',
    'fl0', 'flt10', 'flt20',
    'flt30', 'flb10', 'll'
] 
```

### let constant_labels = []

```javascript 
[
    {
        knownX: -52.5,
        knownY: -34,
        distance: 50.4,
        angle: 0.3141592653589793
    },
    {
        knownX: -52.5,
        knownY: 7.01,
        distance: 35.5,
        angle: -0.6283185307179586
    },
    {
        knownX: -52.5,
        knownY: 0,
        distance: 35.2,
        angle: -0.4363323129985824
    },
    {
        knownX: -52.5,
        knownY: -7.01,
        distance: 36.2,
        angle: -0.24434609527920614
    },
    {
        knownX: -36,
        knownY: 0,
        distance: 18.7,
        angle: -0.3839724354387525
    },
    {
        knownX: -36,
        knownY: -20.15,
        distance: 29.1,
        angle: 0.3839724354387525
    },
    {
        knownX: -30,
        knownY: -39,
        distance: 42.9,
        angle: 0.7853981633974483
    },
    {knownX: -40, knownY: -39, distance: 47, angle: 0.5759586531581288},
    {
        knownX: -50,
        knownY: -39,
        distance: 52.5,
        angle: 0.40142572795869574
    },
    {
        knownX: -57.5,
        knownY: 0,
        distance: 40,
        angle: -0.4363323129985824
    },
    {
        knownX: -57.5,
        knownY: -10,
        distance: 41.7,
        angle: -0.19198621771937624
    },
    {
        knownX: -57.5,
        knownY: -20,
        distance: 45.6,
        angle: 0.017453292519943295
    },
    {
        knownX: -57.5,
        knownY: -30,
        distance: 51.4,
        angle: 0.17453292519943295
    },
    {
        knownX: -57.5,
        knownY: 10,
        distance: 40.9,
        angle: -0.6806784082777885
    }
] 
```

### let p_labels = [] // только метки с игроками (вся информация)

```javascript 
[
    {
        p: [24.5, -22, -0, -0, -96, -96],
        cmd: {p: [Array]},
        cmd_merged: 'p"teamA"1',
        cmd_type: 'p'
    }
] 
```

### let g_labels = [] // только метки с воротами (вся информация)

```javascript 
[
    {
        p: [35.2, -25, 0, 0],
        cmd: {p: [Array]},
        cmd_merged: 'gl',
        cmd_type: 'g'
    }
] 
```

### let b_labels = [] // только метки с мячом (вся информация)

```javascript 
[
    {
        p: [6.7, 15, -0, 0],
        cmd: {p: [Array]},
        cmd_merged: 'b',
        cmd_type: 'b'
    }
]
 ```

## serverAtFormat

### info

```javascript 
info = {
    n: 'info', 
        side:'l', 
        number: 2
}
 ```

## controllerActFormat
### cmd
go to point
```javascript 
cmd = {
    act: 'cmd', 
    cmd:{
        n: 'info',
        side:'l',
        number: 2
    }
}
 ```

## sayFormat
### reached
someone reached his goal
```javascript 
message = "reached_${state.action.fl}"
 ```

### obeyed
someone reached his goal
```javascript 
message = "obeyed_${state.action.fl}"
 ```

видит->принимает за лидера->говорит
слышит->если это мой лидер, то сравнивает
если он всё ещё мой лидер->повторяет
если он уже не мой лидер->ищу другого менее близкого

