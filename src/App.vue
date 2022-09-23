<script>
  import {defineComponent, onMounted, ref, computed, reactive} from "vue";
  
  export default defineComponent({
    props:{
      feed:String
    },
    setup(props){

    let state = ref('loading');
    let errorMessage = ref("");
    let data = ref([]);
    let feed = props.feed;

    onMounted(async () => {
      data.value = await xmltojson(feed);
        if (data.value.length > 0) {

              //sort the items by date
              data.value.sort(function(item1, item2) {
                  var d1 = new Date(item1.pubDate)
                  var d2 = new Date(item2.pubDate)
                  return d2.getTime() - d1.getTime()
              });
              
              //move items into month categories
              var cat = {}
              data.value.forEach(function(item){

                  let category = formatDateSection(item.pubDate);
                  if(cat[category]){
                    cat[category].push(item);
                  }
                  else{
                    cat[category] = [];
                    cat[category].push(item);
                  }

              });
              data.value = cat;

              state.value = 'loaded';
        } else {
            state.value = "error";
            errorMessage.value = `Course info for ${code} was not found`
        }    
      });

      return {
        state,
        data,
        formatDate
      }

  }});

  function formatDate(pubDate){
    var date = new Date(pubDate);

    var months = Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
    
    //January 27, 2022
    var string = months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();

    return string;
  }

  function formatDateSection(pubDate){
    var date = new Date(pubDate);

    var months = Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
    //January 27, 2022
    var string = months[date.getMonth()] + " " + date.getFullYear();

    return string;
  }

 

  async function xmltojson(feed){
    let articles = [];
    let article = {};
    article.media = [];
    let mediacontent = {};

    await fetch(feed,{cache: "no-store"})
            .then(res => res.text())
            .then(text => (new window.DOMParser()).parseFromString(text, "text/xml"))
            .then(data => {
                console.log(data);
                let channel = data.getElementsByTagName('channel');
                console.log(channel);
                let items = Array.prototype.slice.call(channel[0].children);
                console.log(items);
                items.forEach(item => {
                    if (item.tagName === 'item') {
                        let kids = Array.prototype.slice.call(item.children);
                        kids.forEach(kid => {
                            if(kid.tagName === 'media:content'){
                                let media = Array.prototype.slice.call(kid.children);
                                mediacontent = {"content" : kid.getAttribute("url")}
                                media.forEach(mediaitem => {
                                    let tag = mediaitem.tagName.split(":")[1]
                                    mediacontent[tag] = mediaitem.textContent;
                                });
                                article.media.push(mediacontent);
                            }
                            else if(kid.tagName === 'category'){
                                article['category'] = `${article['category']},${kid.textContent}`;
                            }
                            else{
                                article[kid.tagName] = kid.textContent;
                            }
                        });
                        articles.push(article);
                        article = {}
                        article.media = [];
                    }
                });
            });
        return articles
  }
</script>

<template>
  <div v-if="state === 'loading'">
      Loading
  </div>
  <div v-else-if="state === 'loaded'">
    <div v-for="(category,index) in data" :key="category">
      <section class="inner-page"> 
        <div class="container"> 
          <h2>{{index}}</h2> 
        </div> 
      </section>
      <div v-for="item in category" :key="item.title">
          <div class="flex-container nowiNews" data-name="newsItem">
            <div class="flex-item-left"  v-if="item.media.length > 0">
                  <iframe v-if="item.media[0].content.startsWith('https://www.youtu')" width="444" height="250" :src=item.media[0].content title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
                  <img v-else :src=item.media[0].content :alt=item.media[0].title />
            </div>
            <div class="flex-item-right-1"> 
              <h3>{{item.title}}</h3> 
              <h4>{{formatDate(item.pubDate)}}</h4> 
              <p>{{item.description}} <strong v-if="item.link"><a :href=item.link >{{item.linktext || "Read more"}}</a></strong><span>.</span></p> 
              <p v-if="item.media.length > 0 && item.media[0].description" ><em>-{{item.media[0].description}}</em></p>
            </div> 
          </div>
          <hr> 
        </div>
    </div>
  </div>
  <div v-else>
      Error
  </div>
</template>