import math, random, copy, re

# num_of_input = input("Enter the number of input: ")
# num_of_select = math.log2(num_of_input)

# how to draw line above letter:
# print('a\u0304')



#let's simulate only 4 to 1 and 8 to 1 MUX for now 

# how to solve a MUX question (given min/maxterm -> design MUX):
# step1: draw the kmap 
# step2: Draw the MUX table since the input are 3 select and a input,
#         we can choose 3 select from 3 variables,can be any of the 4 var. 
#         in this case, choose b,c,d as s1,s2,s3
# step3: draw the diagram of mux 
# step4: check the kmap draw line vertically down as mirror and check the a determinant
# step5: transfer the logic to MUX 


#we use z(a,b,c,d) to represent the output of the MUX for now 

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

#size of kmap determined by the number of variables in z eg.z(a,b,c,d) = 2**4 = 16
kmap = []
# print(kmap)

#binary counter matching size of Inputs(I)
def binary_counter(n):
    return [bin(i)[2:].zfill(int(math.log2(n))) or '0' for i in range(n)]

truth_table = binary_counter(num_of_input)
# print(truth_table)

#solving min/maxterm given MUX
#step1: loop kmap in binary (abcd)
#step2: deep copy input dictionary and assign values to the unknown variables in select and input
#step3: use truth table to find output based off current mux variables in select and input
#step4: append output to kmap array 
#step5: discover the min and max term 

kmap_bin = binary_counter(2**(len(z)-1))
# print(kmap_bin)

gate_names = ['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR']
gate_pattern = re.compile(r'\b(' + '|'.join(gate_names) + r')\b')

for kmap_index in kmap_bin:
    curr_input = copy.deepcopy(inputs)
    abcd = {}

    for i in range(len(kmap_index)):
        abcd[chr(97+i)] = kmap_index[i]
        if kmap_index[i] == '0':
            abcd[chr(97+i)+'\u0304'] = '1'
        else:
            abcd[chr(97+i)+'\u0304'] = '0'
    # print(abcd)

    for j in curr_input:
        if gate_pattern.search(curr_input.get(j)):
            parts = curr_input.get(j).split(" ")
            value_1 = abcd.get(parts[0]) if parts[0] in abcd else parts[0]
            gate = parts[1]
            value_2 = abcd.get(parts[2]) if parts[2] in abcd else parts[2]
            # print([value_1, gate, value_2])
            
            # Retrieve the function object from the function name
            gate_function = globals()[gate]
            
            # Call the function with the required arguments
            result = gate_function(value_1, value_2)
            curr_input[j] = result

        if curr_input.get(j) in abcd:
            curr_input[j] = abcd.get(curr_input.get(j))
    # print(curr_input)

    selector_combi = ''.join([str(curr_input[key]) for key in sorted(curr_input.keys(), reverse=True) if 'S' in key])
    # print(selector_combi)

    for k in range(len(truth_table)):
        if selector_combi == truth_table[k]:
            kmap.append(curr_input.get('I'+str(k)))
    # print(kmap)

print("kmap is: " + str(kmap))

minterm = []
maxterm = []

for i in range(len(kmap)):
    if kmap[i] == '1':
        minterm.append(i)
    elif kmap[i] == '0':
        maxterm.append(i)

print("minterm is: " + str(minterm))
print("maxterm is: " + str(maxterm))





print("--------------------------------------------------")





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