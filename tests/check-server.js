const fetch = global.fetch || require('node-fetch')
;(async function(){
  try{
    const url = process.env.TEST_BASE_URL || 'http://127.0.0.1:10000'
    console.log('Checking', url)
    const controller = new AbortController()
    const timeout = setTimeout(()=>controller.abort(), 10000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    console.log('status', res.status)
    const text = await res.text().catch(()=>null)
    if (text && text.length>0) console.log('body preview:', text.slice(0,200))
    process.exit(0)
  }catch(e){
    console.error('check error', e && e.message? e.message : e)
    process.exit(2)
  }
})()
