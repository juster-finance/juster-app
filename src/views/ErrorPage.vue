<script>
/**
 * Base
 */
import Page from "@/components/base/Page"

/**
 * UI
 */
import Button from "@/components/ui/Button"

export default {
    name: "ErrorPage",

    components: { Page, Button },
}
</script>

<template>
    <Page>
        <div :class="$style.title">
            Sorry, <span>but there is nothing here</span>
        </div>
        <div :class="$style.description">
            The page you are trying to access does not exist. This might be
            because you have entered the web address incorrectly or the page has
            moved.
        </div>
        <div :class="$style.description">
            If you are sure that there must be something here, write to us
            <span>help@juster.fi</span>.
        </div>

        <router-link to="/">
            <Button type="secondary" size="small" :class="$style.back_btn"
                ><Icon name="back" size="16" /> Back to
                <span>Explore</span></Button
            ></router-link
        >
    </Page>
</template>

<style module>
.title {
    font-size: 32px;
    line-height: 1.4;
    font-weight: 600;
    color: var(--text-primary);

    margin: 60px 0 16px;
}

.title span {
    color: var(--text-tertiary);
}

.description {
    font-size: 16px;
    line-height: 1.6;
    font-weight: 500;
    color: var(--text-tertiary);

    max-width: 600px;

    margin-bottom: 16px;
}

.description:last-child {
    margin-bottom: 24px;
}

.description span {
    color: var(--text-secondary);
}

.back_btn {
    color: var(--text-tertiary) !important;
}

.back_btn span {
    color: var(--text-primary);
}
</style>
