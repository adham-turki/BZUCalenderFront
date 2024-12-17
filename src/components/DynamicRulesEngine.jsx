"use client"

import {  useState } from "react"
import { Plus, Trash2, X, ChevronRight, ChevronDown, Send } from 'lucide-react'

const predefinedVariables = [
  { id: "project", name: "Project" },
  { id: "location", name: "Location" },
  { id: "tractorHead", name: "Tractor Head" },
  { id: "carType", name: "Car Type" },
  { id: "numberOfTrips", name: "Number of Trips" },
  { id: "distance", name: "Distance" },
  { id: "origin", name: "Origin" },
  { id: "destination", name: "Destination" },
  { id: "workingDays", name: "Working Days" },
  { id: "nationality", name: "Nationality" },
]

const operatorOptions = ['equal', 'notEqual', 'greaterThan', 'lessThan', 'greaterThanInclusive', 'lessThanInclusive']
const allowedOperators = ["+", "-", "*", "/", "(", ")"]

export default function DynamicRulesEngine() {
  const [ruleGroups, setRuleGroups] = useState([
    {
      id: "root",
      combinator: "all",
      conditions: [],
      not: false,
    },
  ])
  const [formula, setFormula] = useState([])
  const [numberInput, setNumberInput] = useState("")
  const [isJsonCollapsed, setIsJsonCollapsed] = useState(true)
  const [ruleName, setRuleName] = useState("")
  
  const generateUniqueId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addCondition = (groupId) => {
    const newCondition = {
      id: generateUniqueId(),
      fact: "",
      operator: "",
      value: "",
      not: false,
    }

    setRuleGroups((prevGroups) => updateRuleGroupsRecursively(prevGroups, groupId, (group) => ({
      ...group,
      conditions: [...group.conditions, newCondition],
    })))
  }

  const addGroup = () => {
    const newGroup = {
      id: generateUniqueId(),
      combinator: "all",
      conditions: [],
      not: false,
    }
    setRuleGroups((prevGroups) => [...prevGroups, newGroup])
  }

  const toggleNot = (groupId, conditionId) => {
    setRuleGroups((prevGroups) => updateRuleGroupsRecursively(prevGroups, groupId, (group) => {
      if (conditionId) {
        return {
          ...group,
          conditions: group.conditions.map((condition) => {
            if ("id" in condition && condition.id === conditionId) {
              return { ...condition, not: !condition.not }
            }
            return condition
          }),
        }
      }
      return { ...group, not: !group.not }
    }))
  }

  const updateCondition = (groupId, conditionId, field, value) => {
    setRuleGroups((prevGroups) => updateRuleGroupsRecursively(prevGroups, groupId, (group) => ({
      ...group,
      conditions: group.conditions.map((condition) => {
        if ("id" in condition && condition.id === conditionId) {
          return { ...condition, [field]: value }
        }
        return condition
      }),
    })))
  }

  const updateRuleGroupsRecursively = (groups, targetId, updateFn) => {
    return groups.map((group) => {
      if (group.id === targetId) {
        return updateFn(group)
      }
      if ("conditions" in group) {
        return {
          ...group,
          conditions: group.conditions.map((condition) => {
            if ("conditions" in condition) {
              return updateRuleGroupsRecursively([condition], targetId, updateFn)[0]
            }
            return condition
          }),
        }
      }
      return group
    })
  }

  const deleteGroup = (groupId) => {
    setRuleGroups((prevGroups) => {
      const deleteRecursively = (groups) => {
        return groups.map(group => ({
          ...group,
          conditions: group.conditions
            .filter(condition => !("combinator" in condition) || condition.id !== groupId)
            .map(condition => {
              if ("combinator" in condition) {
                return {
                  ...condition,
                  conditions: deleteRecursively(condition.conditions)
                }
              }
              return condition
            })
        }))
      }
      return deleteRecursively(prevGroups)
    })
  }

  const deleteCondition = (groupId, conditionId) => {
    setRuleGroups((prevGroups) => updateRuleGroupsRecursively(prevGroups, groupId, (group) => ({
      ...group,
      conditions: group.conditions.filter((condition) => !("id" in condition) || condition.id !== conditionId),
    })))
  }

  const addToFormula = (item) => {
    setFormula([...formula, item])
  }

  const removeFromFormula = (index) => {
    const newFormula = [...formula]
    newFormula.splice(index, 1)
    setFormula(newFormula)
  }

  const addNumberToFormula = () => {
    if (numberInput) {
      addToFormula({ type: "number", value: numberInput })
      setNumberInput("")
    }
  }


  const generateJsonRules = () => {
    return {
      all: ruleGroups.map((group) => {
        const conditions = group.conditions.map((condition) => {
          if ("combinator" in condition) {
            const rules = generateJsonRules([condition])
            return condition.not ? { not: rules } : rules
          }
          const rule = {
            fact: condition.fact,
            operator: condition.operator,
            value: condition.value,
          }
          return condition.not ? { not: rule } : rule
        })

        const rules = {
          [group.combinator]: conditions,
        }
        return group.not ? { not: rules } : rules
      })
    }
  }

  const submitRule = async () => {
    const formulaString = formula.map(item => item.value).join(" ");
    const config = generateJsonRules(); // Ensure this generates valid JSON
    
    const ruleData = {
      name: ruleName,
      config,
      event: formulaString,
      active: "DISABLED",
    };
  
    console.log("Rule Data:", JSON.stringify(ruleData, null, 2)); // Log the payload for debugging
  
    try {
      const response = await fetch('http://192.168.1.135:1337/api/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: ruleData }), // Wrap in { data } if Strapi expects this
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed Response Data:", errorData);
        alert(`Failed to submit rule: ${errorData.error.message}`);
      } else {
        alert("Rule submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting rule:", error);
      alert("An error occurred while submitting the rule. Please try again.");
    }
  };
  
  

  const renderRuleGroup = (group) => {
    return (
      <div key={group.id} className="mb-4 border-2 border-blue-200 rounded-lg p-4 bg-blue-50 shadow-md transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center space-x-2 mb-3">
          <button
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 ${
              group.not ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => toggleNot(group.id)}
          >
            NOT
          </button>
          <select
            className="border rounded-full px-3 py-1 bg-white text-blue-600 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={group.combinator}
            onChange={(e) =>
              setRuleGroups((prevGroups) => updateRuleGroupsRecursively(prevGroups, group.id, (g) => ({ ...g, combinator: e.target.value })))
            }
          >
            <option value="all">ALL</option>
            <option value="any">ANY</option>
          </select>
          <span className="text-sm text-gray-600">of the following:</span>
          {group.id !== "root" && (
            <button
              className="text-red-500 hover:text-red-700 transition-colors duration-300"
              onClick={() => deleteGroup(group.id)}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="space-y-4">
          {group.conditions.map((condition) => {
            if ("combinator" in condition) {
              return renderRuleGroup(condition)
            }
            return (
              <div key={condition.id} className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm">
                <button
                  className={`px-2 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
                    condition.not ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => toggleNot(group.id, condition.id)}
                >
                  NOT
                </button>
                <select
                  className="border rounded-full px-3 py-1 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={condition.fact}
                  onChange={(e) => updateCondition(group.id, condition.id, "fact", e.target.value)}
                >
                  <option value="">Select fact</option>
                  {predefinedVariables.map((variable) => (
                    <option key={variable.id} value={variable.id}>
                      {variable.name}
                    </option>
                  ))}
                </select>
                <select
                  className="border rounded-full px-3 py-1 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={condition.operator}
                  onChange={(e) => updateCondition(group.id, condition.id, "operator", e.target.value)}
                >
                  <option value="">Select operator</option>
                  {operatorOptions.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
                <input
                  className="border rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Enter value"
                  value={Array.isArray(condition.value) ? condition.value.join(", ") : condition.value}
                  onChange={(e) => updateCondition(group.id, condition.id, "value", e.target.value)}
                />
                <button
                  className="text-red-500 hover:text-red-700 transition-colors duration-300"
                  onClick={() => deleteCondition(group.id, condition.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )
          })}
        </div>
        <div className="mt-4 space-x-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-300 flex items-center"
            onClick={() => addCondition(group.id)}
          >
            <Plus className="inline-block mr-1 h-4 w-4" /> Add Condition
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto  p-4 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Dynamic Rules Engine</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Rule Information</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="ruleName" className="block text-sm font-medium text-gray-700">Rule Name</label>
            <input
              type="text"
              id="ruleName"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter rule name"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Dynamic Rules Builder</h2>
        <p className="text-gray-600 mb-6">Create complex rules with nested conditions using ALL/ANY/NOT combinations</p>
        <div className="space-y-4">
          {ruleGroups.map((group) => renderRuleGroup(group))}
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-300 flex items-center"
            onClick={addGroup}
          >
            <Plus className="inline-block mr-1 h-4 w-4" /> Add Group
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Formula Builder</h2>
        <p className="text-gray-600 mb-6">Create formulas using variables, operators, and numbers</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Variables</h3>
            <div className="flex flex-wrap gap-2">
              {predefinedVariables.map((variable) => (
                <button
                  key={variable.id}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-300"
                  onClick={() => addToFormula({ type: "variable", value: variable.id })}
                >
                  {variable.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Operators</h3>
            <div className="flex flex-wrap gap-2">
              {allowedOperators.map((operator) => (
                <button
                  key={operator}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors duration-300"
                  onClick={() => addToFormula({ type: "operator", value: operator })}
                >
                  {operator}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <input
            type="number"
            className="border rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Enter a number"
            value={numberInput}
            onChange={(e) => setNumberInput(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-300"
            onClick={addNumberToFormula}
          >
            Add Number
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Current Formula</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {formula.map((item, index) => (
              <div
                key={index}
                className={`flex items-center px-3 py-1 rounded-full ${
                  item.type === "variable"
                    ? "bg-blue-100 text-blue-700"
                    : item.type === "number"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <span>{item.value}</span>
                <button
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => removeFromFormula(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Formula Preview:</h4>
            <p className="font-mono">{formula.map((item) => item.value).join(" ")}</p>
          </div>
        </div>
      </div>


      <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Current Rule Config</h2>
        <p className="text-gray-600 mb-4">This is how the rule config will be in json</p>
        <div>
          <button
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300"
            onClick={() => setIsJsonCollapsed(!isJsonCollapsed)}
          >
            {isJsonCollapsed ? <ChevronRight className="h-5 w-5 mr-1" /> : <ChevronDown className="h-5 w-5 mr-1" />}
            <span>{isJsonCollapsed ? "View JSON" : "Hide JSON"}</span>
          </button>
          {!isJsonCollapsed && (
            <pre className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto text-sm">
              {JSON.stringify(generateJsonRules(), null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 flex items-center text-lg font-semibold"
          onClick={submitRule}
        >
          <Send className="mr-2 h-5 w-5" /> Submit Rule
        </button>
      </div>
    </div>
  )
}

