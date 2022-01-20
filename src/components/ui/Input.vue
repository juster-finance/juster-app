<script>
export default {
    name: "Input",
    props: {
        type: {
            type: String,
        },
        label: {
            type: String,
        },
        subtext: {
            type: String,
        },
        placeholder: {
            type: String,
            required: true,
        },
        modelValue: {
            type: [String, Number],
        },
        disabled: {
            type: Boolean,
        },
        limit: {
            type: Number,
        },
    },

    data() {
        return {
            isFocused: false,

            text: this.modelValue ? this.modelValue : "",
        }
    },

    watch: {
        modelValue() {
            this.text = this.modelValue
        },
    },
    computed: {
        getInputType() {
            if (!!this.type) return this.type
            return "text"
        },
    },
    methods: {
        handleInput() {
            this.$emit(
                "update:modelValue",
                isNaN(parseFloat(this.text))
                    ? this.text
                    : parseFloat(this.text),
            )

            if (parseFloat(this.text) > this.limit) {
                this.$emit("update:modelValue", this.limit)
                this.text = this.limit
            }
        },

        handleKeydown(e) {
            if (this.type == "number") {
                if (e.key === "-") e.preventDefault()
            }
        },

        handleClick() {
            if (this.$refs.input) this.$refs.input.focus()
        },

        handleFocus() {
            this.isFocused = true

            this.$emit("clearError")
        },
        handleBlur() {
            this.isFocused = false
        },
    },
}
</script>

<template>
    <div :class="$style.wrapper">
        <div v-if="label" :class="$style.header">
            <div :class="$style.label">{{ label }}</div>

            <slot name="rightText" />
        </div>

        <div
            ref="base"
            @click="handleClick"
            :class="[
                $style.base,
                isFocused && $style.focused,
                disabled && $style.disabled,
            ]"
        >
            <input
                ref="input"
                :type="getInputType"
                v-model="text"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
                @keydown="handleKeydown"
                :placeholder="placeholder"
            />

            <div v-if="subtext" :class="$style.subtext">{{ subtext }}</div>
        </div>
    </div>
</template>

<style module>
.wrapper {
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 8px;
}

.label {
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
    color: var(--text-primary);
}

.base {
    display: flex;
    align-items: center;
    justify-content: space-between;

    height: 44px;
    border-radius: 8px;
    border: 2px solid var(--border);
    background: var(--input-background);
    padding: 0 14px;
    cursor: text;

    transition: all 0.2s ease;
}

.base:hover {
    border: 2px solid var(--border-highlight);
}

.base.focused {
    box-shadow: rgb(75 135 244 / 15%) 0px 0px 0px 4px;
    border: 2px solid rgba(75, 135, 244, 0.8);
}

.base.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.base input {
    border: none;
    outline: none;
    width: 100%;
    padding: 0;

    font-size: 14px;
    font-weight: 500;
    line-height: 1.2;
    color: var(--text-primary);
    margin-left: 2px;
}

.base input::-webkit-outer-spin-button,
.base input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.subtext {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-tertiary);
}
</style>
