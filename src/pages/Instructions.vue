<template>
  <div>
    <h1 class="mb-8">
      Instructions and how-tos
    </h1>

    <router-link to='/' class="underline-link">
      <LeftArrow/> Back to mod panel 
    </router-link>
    
    <div class="full-width-text-wider textLeft marginAuto">
      <h3 class="mt-8">What to do?</h3>
      <ul>
        <li>Add new comics</li>
        <li>Update comics</li>
        <li>Process reported comic problems</li>
        <li>Process tags suggestions</li>
        <li>Tag comics that have few tags in the pending comics list</li>
        <li>Fix other issues in the pending comics list</li>
        <li>
          <u> Make sure artist links are up to date whenever you upload/update a comic by them</u>. If the artist is missing an e621-link, for example, <u>add it</u> (assuming the artist exists on e621 - almost all of them do).</li>
        <li>Add tags when you see a comic with insufficient ones</li>
      </ul>

      <h3>Paywalled content</h3>
      <ul>
        <li>
          For comics that are released publicly with a delay of up to a few months: respect the delay, post only what is public, and in the public resolution.
        </li>
        <li>
          For comics that are released publicly but with a longer delay than that, upload them if you feel comfortable doing so.
        </li>
        <li>
          For comics from artists that never release their content publicly, I encourage you to upload them.
        </li>
      </ul>
      <p class="mt-16">
        In the second, and especially in the last case, <u>the comics can usually easily be found on many other sites</u>. These sites do NOT link to the artist's Patreon or other platforms, and they often post low quality pages. While this might be a overly glorified way of viewing things, a reader searching for and finding the comic in question on Yiffer.xyz is certainly better for the artist than if they find it on the other kind of site mentioned.
      </p>
      <br>
      <p>
        We comply if an artist requests that we take down their content - so far, only Jay Naylor and vore artist Voregence has requested this.
      </p>

      <h3>Uploading comics</h3>
      <ul>
        <li>
          Wait for a comic to have at least 4 pages before uploading it.
        </li>
        <li>
          If you aren't going to do a proper job tagging the comic, leave it without tags, rather than putting 1-2 tags on it. This will make it easier for people who do tag comics to see that your comic is missing them.
        </li>
        <li>
          If there is a cover page that isn't really "part of the comic", you should still add it as page 1. An example: <a href="https://yiffer.xyz/A%20Darker%20Shade%20of%20Life%20-%20Ch.%201" target="_blank" class="underline-link">A Darker Shade of Life</a>.
        </li>
      </ul>

      <h3>Tagging</h3>
      <p>
        Because I've seen varying quality in the tags, here are some suggestions.
      </p>
      <br>
      <p>
        Most comics should be tagged either anthro or feral.
      </p>
      <br>
      <p>
        Tag species to the best of your ability - eg. dog, cat, panda. Also tag the species family or group. Below are some of the more common ones. We don't need e621-level of specificity though. We're not tagging to be technically correct, we're just tagging to help users find what they want. Explanation: any comic with a dog, wolf or fox should be tagged as canine in addition to the species themselves.
      </p>
      <ul>
        <li>
          Canine: dogs, wolves, foxes, hyenas ++
        </li>
        <li>
          Feline: cats, tigers, lions, cheetahs, anything cat-like
        </li>
        <li>
          Equine: horses, ponies, donkies, zebras, ++
        </li>
        <li>
          Scalie: dragons, dinosaurs, snakes, reptiles, anything with scales
        </li>
        <li>
          Avian: birds, gryphons, anything bird-like
        </li>
      </ul>

      <h3>Keep page sizes equal &amp; don't use resized pages</h3>
      <p>
        In general, try to keep the size of a comic's pages similar. If, for instance, a comic that's already been uploaded has all of its pages in a "regular" size (say, 1400px tall) but you find a new one in a huge size (for example 3000px tall), please look for another version - typically found on the artist's FA or twitter. It might feel "wrong" to "downgrade" a comic's pages from being 2600x3200 px to, say, 1300x1600 px - but trust me, most readers prefer this, as the latter is still more than big enough to be readable, and will load much quicker.
        <br>
        <br>
        When uploading a comic the same principles apply, try to keep the pages the same size. If you find all the pages in a regular quality and only a few in a higher one, please just use the regular quality ones, as long as they're not unreasonably small.
        <br>
        <br>
        The main reason to maintain page size consistency is the reader's comfort - if the sizes vary, reading becomes tedious, especially on mobile devices. Pages with a height greater than 2000 px will be scaled down to 2000 px automatically. The exception to this rule is if the height/width ratio is above 1.75 - to avoid making extra-tall/thin pages unreadable (pages like in <a href="https://yiffer.xyz/Pet%20Treats%20Neo" class="underline-link" target="_blank">Pet Treats Neo by Tokifuji</a>).
        <br>
        <br>
        All this said, <u>be critical when fetching pages from anywhere that isn't the artist themselves</u>. Especially sites like e-hentai, myreadingmanga, luscious, etc. These sites tend to have pages in a <i>lower</i> resolution than what can be found on the artist's pages, so <u><i>please</i> check their FA, or e621, etc, when fetching from these sources</u>. Quality is one of the most important aspects of Yiffer.xyz!
      </p>

      <h3>Thumbnails</h3>
      <p>
        With the in-browser cropper, making thumbnails is much easier than it used to be. Still, some advice:
        <br>
        <br>
        Make sure there are no borders included in the thumbnail you make! This will look bad either in dark or light mode, in the comic "cards" that we use.
        <br>
        <br>
        If the comic's name is on one of the pages, use that one. However, if not, <u>the point of thumbnails is to give an impression of what the comic is about</u>. So if page one only shows one of 2+ main characters, consider using another page instead! As long as there aren't any major spoilers there. Additionally, a thumbnail doesn't have to be a full page - there's no reason why it shouldn't be just a few panels of a page. For pages with a lot of panels, the former full-page approach can often lead to thumbnail content so small that it's hard to tell what's going on in there. Examples of the points illustrated below - the comic being used is <a href="https://yiffer.xyz/Daddy's%20Little%20Secrets" class="underline-link">Daddy's Little Secrets by Adam Wan</a>.
      </p>

      <div class="examples-container">
        <div class="pic-with-desc">
          <picture @click="storeClickedComicData()" style="overflow: hidden;">
            <source type="image/webp"
                    srcset="assets/thumb-ex-1.webp">
            <img src="assets/thumb-ex-1.jpg">
          </picture>
          <label>
            VERY BAD: Border is included (you'll see it in dark mode)
          </label>
        </div>
        <div class="pic-with-desc">
          <picture @click="storeClickedComicData()" style="overflow: hidden;">
            <source type="image/webp"
                    srcset="assets/thumb-ex-2.webp">
            <img src="assets/thumb-ex-2.jpg">
          </picture>
          <label>
            BAD: Page still doesn't give any hint of what the comic is about, nor the characters
          </label>
        </div>
        <div class="pic-with-desc">
          <picture @click="storeClickedComicData()" style="overflow: hidden;">
            <source type="image/webp"
                    srcset="assets/thumb-ex-3.webp">
            <img src="assets/thumb-ex-3.jpg">
          </picture>
          <label>
            COULD BE BETTER: A better page choice, but so many panels that the content is too small. Also, sort of spoiler-y (bottom panel)
          </label>
        </div>
        <div class="pic-with-desc">
          <picture @click="storeClickedComicData()" style="overflow: hidden;">
            <source type="image/webp"
                    srcset="assets/thumb-ex-4.webp">
            <img src="assets/thumb-ex-4.jpg">
          </picture>
          <label>
            GOOD: Not spoiling the surprises, most main characters clearly visible. A single panel is <u>not</u> always preferable, though.
          </label>
        </div>
      </div>

      <h3 class="mt-0">
        Other information
      </h3>
      <ul>
        <li>
          You can add/remove tags directly from a comic on the regular site, via the "Add tag"/"Remove tag" buttons. You'll skip the suggestion step as long as you're logged in as a mod.
        </li>
        <li>
          We don't host cub comics.
        </li>
        <li>
          When there are many, pending comics are published a handful at a time instead of all at once, intentionally.
        </li>
        <li>
          When adding a comic from the "Comic Suggestions", please press "Adding the comic" before you start, so we don't end up with two people gathering the same comic's pages at the same time.
        </li>
        <li>
          The mod panel is being upgraded piece by piece as I find the time to do so :) I've got tons of plans for the site, but with a full time job i can't make things as fast as I can think of them, sadly. You might notice that some boxes look less modern than others. Those are the ones I haven't upgraded yet.
        </li>
        <li>
          If you've got any questions, ask! I'd rather spend my time explaining things rather than having to do cleanup work later. Thanks again for helping out!
        </li>
        <li>
          By popular demand, there's a social telegram group as well: <a href="https://t.me/joinchat/zPsjJoLvN9M1Y2Y8" class="underline-link">https://t.me/joinchat/zPsjJoLvN9M1Y2Y8</a>.
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import LeftArrow from 'vue-material-design-icons/ArrowLeft.vue'

export default {
  components: {
    LeftArrow,
  },
}
</script>

<style lang="scss" scoped>
h3, h3:not(.mt-8) {
  margin-top: 2rem;
}
.pic-with-desc {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 200px;
  margin-right: 1rem;
  margin-bottom: 1rem;
}
.examples-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0.5rem;
}
</style>