import math, random, copy, re

def AND(x, y):
    return str(int(x) & int(y))

def OR(x, y):
    return str(int(x) | int(y))

def XOR(x, y):
    return str(int(x) ^ int(y))

def XNOR(x, y):
    return str(1 - (int(x) ^ int(y)))

def NAND(x, y):
    return str(1 - (int(x) & int(y)))

def NOR(x, y):
    return str(1 - (int(x) | int(y)))

# inititated multiplexer config
num_of_input = random.choice([4, 8])
num_of_select = int(math.log2(num_of_input))

inputs = {}
select = []

for i in range(num_of_input):
    inputs["I"+str(i)] = 0

for j in range(num_of_select):
    select.append("S"+str(j))

z = {
    "A" : ['a','a\u0304'],
    "B" : ['b','b\u0304'],
    "C" : ['c','c\u0304'],
    "binary" : ['0','1']
}

if num_of_input == 8:
    z["D"] = ['d', 'd\u0304']

z_track = copy.deepcopy(z)
z_track["gate"] = ['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR']

for i in inputs:
    if len(z_track) == 0:
        inputs[i] = random.choice(random.choice(list(z.values())))
    else:
        temp = random.choice(list(z_track.keys()))
        if temp == "gate":
            first_choice = random.choice(random.choice(list(z.values())))
            second_choice = first_choice
            while second_choice == first_choice:
                second_choice = random.choice(random.choice(list(z.values())))
            inputs[i] = first_choice + " " + random.choice(list(z_track.get(temp))) + " " + second_choice
            z_track.pop(temp)
        else:
            inputs[i] = random.choice(list(z_track.get(temp)))
            z_track.pop(temp)

for j in select:
    inputs[j] = random.choice(random.choice(list(z.values())))


print("randomly generated MUX: " + str(inputs))

# new algo for solving question
minterm = []
maxterm = []

index = 0
table = {x : [bin(x)[2:].zfill(len(z)-1)] for x in range(2**(len(z)-1))}
print(table)
while index < (2**(len(z)-1)):
    selector = ""
    for key in inputs:
        if key.startswith("S"):
            if ord(inputs[key][0]) < 97:
                selector = inputs[key][0] + selector
            else:
                k = int(chr(ord(inputs[key][0]) - 49))
                if len(inputs[key]) > 1:
                    selector = str(abs(int(table[index][0][k])-1)) + selector
                else:
                    selector = table[index][0][k] + selector
    table[index].append(selector)

    # finding target (input) for the given selector
    target = "I"+ str(int(selector, 2))
    table[index].append(target)
    value = inputs[target]
    if ' ' in value:
        first, gate, second = value.split()
        
        # first
        if ord(first[0]) < 97:
            w = first[0]
        else:
            k = int(chr(ord(first[0]) - 49))
            if len(first) > 1:
                w = str(abs(int(table[index][0][k])-1))
            else:
                w = table[index][0][k]

        # second
        if ord(second[0]) < 97:
            x = second[0]
        else:
            k = int(chr(ord(second[0]) - 49))
            if len(second) > 1:
                x = str(abs(int(table[index][0][k])-1))
            else:
                x = table[index][0][k]

        # calls for the glopbal gate function
        gate_function = globals()[gate]
        y = gate_function(w, x)

    else:
        if ord(value[0]) < 97:
            y = value[0]
        else:
            k = int(chr(ord(value[0]) - 49))
            if len(value) > 1:
                y = str(abs(int(table[index][0][k])-1))
            else:
                y = table[index][0][k]
    
    table[index].append(y)
    if y == '1':
        minterm.append(index)
    elif y == '0':
        maxterm.append(index)

    index += 1

print(table)
print("minterm is: " + str(minterm))
print("maxterm is: " + str(maxterm))