window.onload = () => {
  const seasonsMenu = document.querySelector('#seasons')
  const resultsBtn = document.querySelector('.btn')
  const graph = document.querySelector('#graph')
  let screenWidth = window.innerWidth
  let season = 2021

  for (let i = 2021; i >= 1950; i--) {
    let option = document.createElement('option')
    option.value = i
    option.innerText = i
    seasonsMenu.appendChild(option)
  }

  seasonsMenu.focus()
  seasonsMenu.addEventListener('change', e => season = e.target.value)
  resultsBtn.addEventListener('click', () => getResults(season))
  window.addEventListener('resize', () => screenWidth = window.innerWidth)
  window.addEventListener('keydown', e => {
    switch (e.key) {
      case 'Shift':
        seasonsMenu.focus()
        break
      case 'Enter':
        getResults(season)
        break
      default:
        break
    }
  })

  function getResults(season) {
    const headers = new Headers()
    headers.append('Accept', 'application/json')

    const init = {
      method: 'GET',
      headers,
      mode: 'cors',
      cache: 'default'
    }

    fetch(`http://ergast.com/api/f1/${season}/results/1.json`, init)
      .then(res => res.json())
      .then(data => {
        let raceWinners = []
        setWinners(data, raceWinners)
        
        graph.innerHTML = ''
        drawGraph(raceWinners, season) 
      })
  }

  function setWinners(data, raceWinners) {
    data.MRData.RaceTable.Races.forEach(race => {
      let name = race.Results[0].Driver.familyName
      let racer = raceWinners.find(raceWinner => raceWinner.name == name)
      
      if (racer) {
        racer.wins += 1
      } else {
        raceWinners.push({
          'name': name,
          'wins': 1
        })
      }
    })

    console.log(raceWinners)
  }

  function drawGraph(raceWinners, season) {
    let totalRaces = 0
    raceWinners.forEach(raceWinner => totalRaces += raceWinner.wins)

    const barHeight = 30
    const p = 70
    const w = screenWidth >= 500 ? 500 : screenWidth - 15
    const h = barHeight * raceWinners.length + p * 2
    

    const xScale = d3.scaleLinear()
                    .domain([0, totalRaces])
                    .range([p, w - p])

    const xAxis = d3.axisBottom(xScale)

    const graph = d3.select('#graph')
                    .attr('width', w)
                    .attr('height', h)
                    .style('display', 'inline')
        
    graph.selectAll('rect')
        .data(raceWinners)
        .enter()
        .append('rect')
        .attr('x', p)
        .attr('y', p)
        .attr('width', d => xScale(d.wins) - p)
        .attr('height', barHeight - 1)
        .attr('fill', 'black')
        .attr('transform', (d, i) => `translate(0, ${barHeight * i})`)

    graph.selectAll('text')
        .data(raceWinners)
        .enter()
        .append('text')
        .text(d => `${d.name} - ${d.wins}`)
        .style('fill', 'black')
        .attr('x', d => xScale(d.wins) + 10)
        .attr('y', (d, i) => barHeight * i + 90)

    graph.append('g')
        .attr('transform', `translate(0, ${h - p})`)
        .call(xAxis)

    graph.append('text')
        .text(`${season} Season`)
        .style('fill', 'black')
        .style('font', '32px Cantarell')
        .style('font-style', 'italic')
        .attr('x', w / 2 - p)
        .attr('y', p - 25)

    graph.append('text')
        .text('Total Number of Races')
        .style('fill', 'black')
        .attr('x', w / 2 - 70)
        .attr('y', h - 20)
  }
}