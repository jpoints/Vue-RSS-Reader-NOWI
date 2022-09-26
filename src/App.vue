<script>
  import {defineComponent, onMounted, ref, computed, reactive} from "vue";
  
  export default defineComponent({
    props:{
      feed:String,
      loading:String,
      error:String,
    },
    setup(props){

    let state = ref('loading');
    let errorMessage = props.error || "We ere not able to find any news items. Try refreshing the browser.";
    let loading = props.loading || ""; 
    let data = ref([]);
    let feed = props.feed;

    onMounted(async () => {
      try{
        data.value = await xmltojson(feed);
      }
      catch(err){
        console.log("An error occured when trying to read the rss feed.");
        state.value = "error";
        return
      }

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
        loading,
        errorMessage,
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
    <section class="inner-page"> 
        <div class="container"> 
          <h2>{{loading}}</h2> 
        </div>
    </section> 
  </div>
  <div v-else-if="state === 'loaded'">
    <div v-for="(category,index) in data" :key="category">
      <section class="inner-page"> 
        <div class="container"> 
          <h2>{{index}}</h2> 
        </div> 
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
      </section>
    </div>
  </div>
  <div v-else>
    <section class="inner-page"><div class="container"><h2>September 2022</h2></div><div><div class="flex-container nowiNews" data-name="newsItem"><div class="flex-item-left"><img src="https://nowi.org/_resources/images/Brayton-Point.jpg" alt="Brayton Point"></div><div class="flex-item-right-1"><h3>Prysmian Group: New Submarine Cable Plant in the USA</h3><h4>September 18, 2022</h4><p>The press release is here from Prysmian Group and CDC Commercial Development Company announcing the signing of the contract for the purchase by Prysmian of the site identified in Brayton Point, Somerset, MA. (NOTE: The final acquisition of the site is subject to securing state permits for the construction of the new plant. Prysmian Group’s total investment to build the new plant will amount to around $200 million.) <strong><a href="https://www.prysmiangroup.com/en/press-releases/prysmian-group-new-submarine-cable-plant-in-the-usa">Read more</a></strong><span>.</span></p><p><em>-photo rendering of proposed manufacturing facility</em></p></div></div><hr></div><div><div class="flex-container nowiNews" data-name="newsItem"><div class="flex-item-left"><img src="https://nowi.org/_resources/images/DEME-LLC.jpg" alt="DEME LLC"></div><div class="flex-item-right-1"><h3>Vineyard Wind Selects DEME Offshore US for Wind Turbine Installation</h3><h4>September 15, 2022</h4><p>VINEYARD WIND, a joint venture between Avangrid Renewables and Copenhagen Infrastructure Partners (CIP) announced in February that DEME Offshore US LLC will serve as its contractor for the offshore transport and installation of the wind turbine generators for its Vineyard Wind 1 project, the first large scale offshore wind installation in the United States.  <strong><a href="https://www.vineyardwind.com/press-releases/2021/3/31/vineyard-wind-selects-deme-offshore-us-for-wind-turbine-installation?fbclid=IwAR3JMya303efWbMWVo4L5kJ_h6Ujd3oKsHc0ZhH-DbQMrxrUDuwBHA9Vl_4"> Read the Vineyard Wind article</a></strong><span>.</span></p><!--v-if--></div></div><hr></div></section>
  </div>
</template>