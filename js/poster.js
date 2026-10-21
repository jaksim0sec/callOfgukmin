/* Single responsive campaign-style poster renderer; no gameplay state is changed here. */
(function(global){
'use strict';
const W=1000,H=1500;
const font='"Black Han Sans","Do Hyeon","Arial Black",sans-serif';
const plain='"Pretendard","Noto Sans CJK KR",sans-serif';
const palettes={
 '무소속':{ink:'#28282b',accent:'#51545b',a:'#e7e3dc',b:'#cac8c5'},
 '자유국민당':{ink:'#33292b',accent:'#ac343d',a:'#eee2db',b:'#d7b5b1'},
 '민주혁신당':{ink:'#20364c',accent:'#205ca7',a:'#e0e8ed',b:'#b9cddf'},
 '진보연대':{ink:'#382a37',accent:'#a84473',a:'#ebe1e8',b:'#d8bccb'},
 '국가수호당':{ink:'#243345',accent:'#283f68',a:'#e2e6e8',b:'#becbd8'},
 '실용미래당':{ink:'#284039',accent:'#257968',a:'#e1e9e1',b:'#b9d5c9'}
};
const ageKeys=['infant','elementary','middle','high','adult'];
const currentScript=document.currentScript;
const atlas=new Image();atlas.decoding='async';
const posters=new Set();
atlas.addEventListener('load',()=>posters.forEach(el=>paint(el)));
atlas.addEventListener('error',()=>posters.forEach(el=>paint(el)));
atlas.src='data:image/webp;base64,UklGRpY4AABXRUJQVlA4IIo4AADwLwKdASp+BGwCPyWOwFmuKT+lIrEKe/AkiWlu+/doxcIPj508qfuL3rrg+M0A//+4fP+yGl50afqH+89F/0b/E8lffJQAwh/Bf+vX/9mnav/T+Dr53z/v11HF5584z7uZ+PtPRY//nog/gP/sNVWedBuOpAAJE+tjUgAEifWxqQACRPrY1IABIn1sakAAkT62NSAASJ9bGpAAJE+tjUgAEifWxqQACRPrY1IABIn1saj/oXRShTIWwd0OOpAAJE+tjUgAEifWxqQACQxLJi2W8kxjnY8jUOQUryBNx1H/Q3NIZCgp1IOqdLolnnQbbEXrSDiNYNuNdFkoUvHr3KnSORm86DcdSAASJ9akXXxEam6arFxJaxSeuJuMwy4EedvS2QzpAxJ1QnYnvV3iTJ7rRLPJem44XwSUZdClOcZVt5aqH0bCqtwbZej8nebEUiC/1P4RGH92fxyzzoN2/xx1H/+d+qIzf/Y2jUCLKnvYbp64mUhm9meWp9+BV0vsjy5q4sbZE9cilcFAWp7SpjctVbxlJ6Ynv8sv63fwnYTWxqIOB8SzYm46Hi6IbtNnEgapUrB3g9nIn1qGRr/P/hIugntfZ4uaOixjeynu+87Tpo3+Epo5Jn+CpAiR3Vn8aIxeFc+ZynY85/e72wDzmOM+2gUtuLDSV01K5iE+VIpm7/zCHLxjyJDmR+CJfw55TbYkeSNCa91HxaHEeyBxoVUAiU+UA50xOfoObi2Hv3dVwJFp8KwpHZR0LYnr4vyCRHQzfPPLEYqzuwFfDNZkK1w5J7e/FOwPfyjfWqLxszu/LA3eGYbNOngRStXjLB7iNTl+O1bP3YlLsIiq7/uKfe4mEUaqXtXxAD2+k0dw4ZLOWHcCM4ypcnV09cPjy0mdbuV5w5P+SDyMp8Xcd+GyF8OwnYJ2+w2D5rnBw7Tma8lmpQOhKDeAdt0mzoM/iIeyOA7i137ovVnsoA7tZKC/nJ33JHF5ybVrKMiSJOCiKFa1yRLMALUO4NJciF9QBHTezA4G4khDZ7orUWaOZXmBO020r5EdcQKxtQ3MIuKw0YwLi9GQHddC0NAB00IcP4uGwAOmQCQAEiXlQY+Ff0xiENEJhRZVoWkjyYBwUL1IzJCSqMRMlWkcar7sY23KbajtOKSuqZPq+l8ugZOPkIjS9y2bdnRkTGqoBLrUwwGAUdjIagxTHsJFZxOJOIo71yLXQyk4nuX5CJZvoNlT7vR3ld/p5l59XLLjJK7aVUt2NzIFbehFAH1fAlwTTGbDst1UnODWS0dDMujVXlW7GvWivafR/FxYF/jabEiNDKqez+9uOv0QQd67wcqZ8MYH0WYss9CjUFQ0BPTPizlI8vxRotjVZVGQ5PkSIjNpJ9Y2VyUMIGPb/yql0aM3+7eIv3Fu0kDZ5yH6qgdYQkq3IfePjLdPJiBixBXI63NuAv/8SPOkqsIG7a8Oq6CsaN33m5XRRxgDXMWfsSh0ZV2Z3vHaVDSFsAkS2TQ60eVkWhi0geiRg1XE7hStZy5d8wiBhxENSjFsIkEbu2NRPSE/ypB/IbjUTXRvlioxbSqlN3YaRWyUwWtgEr8BOxgDQDkdNNKrFhcsHslRP/RQM+XFFPlR07yy0oERNx49e/yhLupW0aaRDJn/g/x7ixVA6wVI/rPOftlqRDrBKoeRxiHf+f1lmNDb2xEmwzvf66AFimTQ1RTaW6EohscUrjqP+ST6E6x7WBenyFTOZem/pN+o/c9hWOMoIkR7JOarfChTamkH/qNRxGFk5oQvSHUfL5sqEhUln0Rq8OhCIhDrcShqAjNFqm0z6/HHHS5TcZivlOSNra5y3SJn1zohU70dZ8h/p+KigJccU+t7sIn2OGcGmXxo2cO9vA1NbhJfrzFwKZvON/8EpJSkTYcSKvY+cLHPnAo5zVdDXWfGsVmAGgmuQf2b9z3I/963us1c16wCxIaYDyWXwbSnQEEXSGYyaBoCOlvaHffm0dn0bBPUJvvB4R59LyrG9djzLkK85EAXLwVHR2bF1nZiVNChxv9Mb/8M2/95v8gHrWjroeEclU7Px7VIGWG0q5TXtkodWx/ZadYUH1zOhUd7yxnEZJfO/0QSLEmXsMqOHwdzqaOHRMBQ/yfgrj49DRHOD0vSZzb9G0NJwNclpIlvbquSVNvmYcmy3lz6moL2q74g2GQBy2w7UPAlksRmlNHEZJ50bRaGg9IQAVqWsywGAxV09sAE50jE7Zw7GCsM5/NEvD+R0SN96DsrBBEyYIHAUOIi1Uesd5Bk+67AaG5spBwObBz7p6MNkbFjUHDTzM4rRss4Q1wnxkxbgIf+CJVkdrYJAaq+QxMZS8fXT4v2Js1ob7HXLnXUR0HfIPbd8HxDbPDaz7jdAxtjdZFdh0skt6XH0ZtcytYQQXCyqa+sVhjaiBdR0IYyhYIr1TrlpdMKizdki+NhQqDDGrzXhQfYNRRErELWjJJnQH9g5mld6TJNknlLxbZW8dPiwkRW6locZ9oLquV06L+epokhKwYSYT2j4NvgTsaM5GDA21Xp+xM3nRA3mks2QMgCKkyBpnkWswhqozcyJjLYZVUekRnuDRBuiSdsxyzWraAXqpQw6b+cBTh7/S6/rgKk454LeGmRm46H4rBsJErMa+H7qzv46PajFn7MTaAmr1cxfom6wqEpAIzUWIFhXhy0CpfNR7fAcUJnLkvn1qwl439dWzhDQbJbDzqaFmuwRDhk73uNDfq621762fp3vxoAn5DaWE8j0GBnRR8JSBHp34TNHJQN+Fb6w+vNJBZC0Qb0GaIcQ11to1pH5Ydd4HoTLzkOKpmFgE9nDDboiuyvftGc5saggaY5rsmiBcnuOIBL1awCYYcTHu6nNqlZYHcLLwMru0slc85XBCubGBZ7RCP7LiHfwyvCmVknFTk86U9inWp+wr9/GdVWIYzHKqtD0s86EpGJuOpAAn6wdLhg2SqVjEILukH/S1jtAzjWZ77eWs1KCLrqlzeWedBu3+OOpiRviCpAAAi6CRPgYN3s63cs86DcjNIHWxqQhRjbhfqMOwgiY6550G46kACYIAkT62JdlFo+IIXw2V4iq45kyIkukK21lOnfBVlJqf//T0RUmpxMn9ULX2HmG8uztjURzk9jcuvZmmotUVkg2nezuveawff7ZarLGXxrXoYJeumWpGKGU+aVVZu/LVGvstTRcbJo8NT85gxbCqzyZYlPVtEqs5LKmMdaBx3yfOzVtLasz66TV2TeKsAhYFgreS4tQ7mPvuJSgUY6GqArON8wHkbD+hO5eHQVMpQJsXYZjlJr+s8miUTLf8rykf2C//kgVJrOw3yRm3paeCGyUzLzn8FIk4mpjlXtiRqTtzrHIJ/YWmbghkZmT22V/h77k/0KspngT2Pf7ANDZSR+rBWlQE5yZBIprD5+Vts1DfArBMF4JXyHQ1wV8aaScl6UMkucsoVY2rj7qxAbPaV9GGkRvwjJTQv2xfnXr9gb6X79OjTpVi19e9V7VZuE2JM4U/SgtyZT8WzCVVVrTcHGUXBthsakUzmXehAG9SwnSWCIa2KyNwo6h2c4SZkTYTRjM0DOb/5paPf1hpK90xOktiLg2RLNPiVollhrgcjqNRSAVzaNbQFH0vhnYBDBaeXmb6M5mNg2TIiTfupKVPNJLvMnKbqnQJXY0vMBtfTxqbyxulQbz9OCvA5vLIlI3eezkzBaLQHQh4eNi7xcvnrQabhzzaBlVG0A0Cp1zlsnzwzSQuFD4wa/geAennOz2eT1sR3RhH0GEC+TbN5NYOVSAJUGvltsKVmB1ny6OiWIHntMFqv5wORKN1Hm7y0EPg9Yr9VR/0HWGaFUaALZWIjBEoOcJfIhbfYn5TbWWEcnNV4nKYMAt/lJ14UWp9IdvXTNyx6Wz6l69unfOshRwU7rcA9AQ5OnONtazbRsm6Y7uqXEonnVBr737PZliUKjohb+eCmr8uHUVNM6JTNGcmqR4G/tdOEdSSDiSRygEzd6ZHTvWjcXe3qVPenzyQr4LDOUlpwuA9Y4ZzWsb/6qDqd0195EazjSC3CLB8oA0a8aKn/VBfeVg4RAddWmyDurHSw4d1iQCIl2LQKaiSu7Y+NxjjBjwLPMonuzHvJwz19u1LXdSOtNr+38CoxnqTW8hRlCTDaLTpkhVto4c4VQaPjTR/Wm3QHQNufBF2tedf//YyiG8qnRVyT2XeN1nIfLKP3WOluwfZZMMTQBLOFlP1zRnZX8swdCn9YWH4u1pwZUR9J+CjeQNQT5x7g/Gl8CJLqaCtFuvs9kefkkY0BA5IuT0B46tHLW6wcPmVWn8R4xWGB21DY1ka6JHLvPE5Gnz2kAAG9o6w0Yu/cHsKDptVRWGhALh1ijOxP01JbwVjzqSqtsiuz8eAg7KX6wcjjAJDsA03XivDyyrGvIW5gs4Su0z3wr4Tb6j6KhRiaFS/46kO4i+B4lIq3nZ7JI+KOL3wMY3GIE1NoCZRcHHAKe6jly4H78md0dZbE9S1VrCcDrFmVC9UvD4s3b6YK9QCTIMbX8bbOQcDDzYVTG5DJRvO9voiicgcW9sSdnqEWXeNAnM1GvJwUgC+2M+ORiV20vDlAMQ9Zzc7uRya8d6gmpqdRqS6ER0Vkn7VKHEBIbD/VYhFFn/NIDjZElNMOF7/SDdI3Blv7RHIYaDMQHp5c1FBn+elSuVBTLAtJ+sHXtCXfMpyqK06a93MDns5wd1E9IsCzj84AiKYfTwnNEKr3v5CVTsHQQZ7IGKmaUi+1mDDXakx+JNvAMijDoCSxHUKnOw8wff1TBKmq3+q2lViVQKoM7JT/omczovCzfdvsQAu4VZCn95n3EatJHktMavZvvbwKVseVo/5IKF8UhJ8iuOChu/NyhXjUs5zHUVloIP0i81oOS+hPClx4VolyKZdrFpIU6cHhj8VKMdgaQaPnGha7cS5ODJ56BWNPHit5X8Kw/l+i788kheHhljTgxzF89aZX09km0hblwlZHIFuSypBoYHoPrRSP45jndLhPqXU+RAl5DrB+u0ruLvXf7E1zOq39Xa6lijuTUicF2ng3azGtc/7Ig0ZwtTP393CK9hGC2Aztb2ZDg0vx849rJ+9/OE2ll155FF9bZBN1/xDoEhlSo54/w6z0aKP/F/+aXl8hBHf6sevYwAKzTLwLXBkYAbLbkOSSKfray0Sb2C2YDp6CJqn2LaDFupB46P1dr3f/5uFrwSGux1nmzJYMdexgk7Rx61jaDLq+sKXIOkPUeZmAusn1EUZXdNTbMwRIYhuJmqhs1KSLWh4PHP9jQn2wyViyBrpWNT/IW98Ni+aPxC+/ODmnaoiukXVKw0cKvLM8qKU0ehafEBBVdbsq3RGuhqyCbWvoQwGYU5rxhJwyuwGzKCMzOD7/xwoe8DHsjfSlk2fZQB3TQhB/OEKqNxx3xx45f+IrD5qfgeBqi82uRP9a6gstCMkPLra7VeC3J5pMs72gXvVqxMipWqrJJYn6O0i0o8+VX/GpDtMsHJf2NVVuq1zVS1UFwhdoWmW5ztaX3OXogNgb3qsF4eu+2fjoUsxPlkxvLQkDagVqPytlf18dFn7AHL173OvEWz6qOADr9wgjLvPFq+VKksN0UYbA5dwfcCO7LO3o/LOK6JuEO/wlmiIOMK52VdedE2dgcWaaMPNxtVsB+sWWwTYepvZJ8XoQ+nU2Hj6B3SeWNGkAkQ6LGzB6+sGloW36eWb47YRXg4AXtnbD5l3UsfE6WeA1Y8a4RRKM9zHMKtJQnH2Ym037JUeEnOQ45xnnEutb1PT5sl1Izi0I1j/WD9ux36C/dn54AtE0qa4973NKKm1M0oaGsKHa9kJEJClfQrE/icvdkSjMGXYp2LflliE1etvhqStu3PW7ulpQJo0RL2x12j+ssuKOxaZwzt2OgJafHSlzFItMceS9yYON2rF25DHHaX3as7RBbqvY83ehvbgnL/xdXnIyidiDplKw22yYRxwAA/ucLwAAAAAAAwZAEAAAAA/TlBC6HatWdh37mzbTXoCdrAxtS5cUC+G3mlFIu0+SPhBxQAi2Ah31GCaDfYQWI6fdCEiqEc7Zm12QgyEueg5raB5Bv3bgPrCHoF8Qr1Yv0aNiMjwHOgA+cLijlPnzOfJkU7Z0smHtVa4Rdz3Xz+xX8mounzXQF+hu82gxneAa8dzlK9p6HzfjFbk5MR7oKB92Wb2XEU1e6fzw+r08s6VDu6hksdp9qgBzDBIS/JWbLExzYhGJtj4RO8zrrmgXoHvG1SiABA2KDzx3RbYqqBHVGcp2bQExSu7XiOG7ZJ2abMjR8SKWccRY8Q/f+X8xznu6VWzCOUXzfZbBz7qA2xHHjYWfh9BjMclMmVZ3ZWe4x3Lg6cnAWSDIXBKgrRfIOWQ18idYmovPcviVk5+UQY/iKzn16JzxLsLR/0DMztkxY/LP9xEFYfB4/S7+GqAZJZMUDLiLDfQ947T1Unl7pYRNkXSqamafd67dWDJ8GG35zxEDIb/Eb8277jU9Udum1k4OvCbhwRURoKgx36SZqQMRXXQGy4j5gP7YVmtzN+110WzFJ4daIz5MeZWSAYKekgOC1D8MEq7eVWvDhLSxEnKIgAKGeMJW/RxN/fh/S0eLVCapQEDcSj+u15XlZkO2YBVivjKprprtaUpFQHF1wup56T/2nbFO+QOx+kBiZ5CuvvJkE6JqIiQF9P+G73Cs3d/cneO0tV0Sjt2JZdgO/U7bQhDdtsNGLENBG9bciUL4KXCLoBRVloHiY0ixszIJgFGoM5LYu6aToxIqnl3Hz7TEi61sxjEZcwRkSdkpY4YNi4CHdmg7ohvd1tRhiVS8kCXzN3z5vmw91+jW5qpOZGodP3yFOZxXhECIhxO7Xa7WvUVffAJWdiMPSd72bGxAS1q8QHaD3cJScQsHLewlxG7nt7ZVoWp5GKQ2iCcxhf1gCy2bGheHRLU8xfJzIgVsLlFGhMI+zEu/DTGlAjGtiEPH6bz2sLprwfFkZwUebzE77eNmV1Wl6bvRpj8OrIWjnT6jLC9l972e869SROL5DGDcEMTK7KfU3qHMphFyHDVHJVOOtkWP43Y0h621uRocah9CyhtJXL1UdDFzDgASckvCm47vQxTKgqG2mn/2RWv8YW/IW2ZcvaCWeNOknemcde+miGyMVmLm5VsL828I95c62GTPr9DzqJslCz0CQtKSyou5LI2m+lBlMV1TvMPL01J8ANfRMbtrII4D3DQ2o2uBwon8ttk+8vkRKgeJyDP5dvZTTPajrD0fpVcNMHpMyP0v1SWDKmK9OdeiZjJiukI8nZl1JlVnIj1PS6vLYZF1X7KwRD914y/QL1g3d1SbnubRN0knKF3IfUHknIc6TMrjgiICbHWfE4WeG9BgNYi+jEWkI1zotgQ5qMcB4MXrfvWc32JTVvu+3oqBZn4Yw1XLusdYkmJrswaTobV4FhCLOncsDi32YqBGrN1ugNzv6YPaJtMCHMtXldtqpehEbLzNydDCbGw0nRlsUHIMUeHvB/X4ojnIONh0CdjZ9QM6oxwWnE6punbN4WO7AQn/0uadwdwiZZWK7b85+oYBUG0JSMEyNc0LmPtus4qFupNDBh4XV5Ren9TodRqHo8Ls4z6MCMIC2VMLUZRNIw9QxsP0AaIusMvs7jF6u6N05nwyy6KT4bKHE+iWSSsGVqpq0a0JiiKXUFc9nJqKIZFLywXwzmIXWBN6ZnjnPz7WkujcKEtemNdBUlZHlsvIPzM6zWpXN7e8w01agjtxkyEeBhBKrjW0723UnzsCQRwD+9uP5Q5iBbymXEXlFzAIOGXtX3v8ULvhIKP+Qz/wjltkNj6806fWOd4onk/dPPgIOiMLDzanPwb8W0U8v1dOVAn0W1Rc5RlnbviTvvMPWse2Rl83QwtuOOqjZnVYYnIghXGCbcejrEeAfgQXlwhCLvERQVp4Q1ioZxds767S6pe9PhZ627SJWxflUx61hYIgobX/HM9c37ykPE4KkEMIeGv9Uht1cDTdizZc7ktMUx2GTkjuV12JVDUrQnMR8nMHiA3oITXsi1CT6GJFYUH0tlz5QOt/2eLDaczFTUW9IiriA0CWOdvjJbHnvYYpT0KQvHXgdXmxujJMFSlqFu0Wm5WGk93JjuO6TmWtesWJ89gNpEQ8dfqsiEP1e5Jr+MZYuteTq3zQ9XbAVtWpZvN7iuJaXavgAVJbDkQ6hV9w8KVEZPBYcv27k5BlHIa0ETRkl8JhdZ/21GGsZf+33fwh5yEZPReu8Srg+2PIbVh+pCRMHaoN1WZ814juAkIevJB8lqZtg1m3/HnpqGK2dzKfqnqZip2Fzw/lUOF7eyTj7QN2K0f27cEus8oL/vW3yz1JgcZgMG/1Ndv89/llCMFqEqlvZsJ4ZiCrlKCkvC6Du41zniNnyslERWOMTyN9wJVQHmjDfOBr+RSgvu1l8JCIafbEMDBFXT5teqUmD3Exzk2jZQPZEHAqUwoNJfumkTzo3IdDPBnEFgvhp1SwkL3O28XTOk+MpQB/xJS9UwbL9bq0olnS9YFcSZK413a2bligVVMhwI3z2zM1VgG9Bt+FL1zJ/QOyIUa+CbcWhNlHNKQmqeTrsH2dDLRqhJGyJ4PW7s/pOyg4FUU6Ht0P8eN9KqmGy3AE81iMSBb/FPHbLZDZh75Z7Zhq7XD8mvGbN8K/H2Wi86G8oXdqEMmQaggK7KiOQDQDDZybWp/ff7P4tX/GgaeosxQSVY7eAgS4VZJtV0bZfGY/nuU0t2YVXhO23f+FfpWYx9Por1mvfzUwLvzTW4TZ6feHVPhpMMqqc9yl2PdiggznQyqvB0NK4ceVR5/sX/GtJXXK44SVjGA0cFAsL3IBgkHT26IAI/hn7fFcB1pIN8qrEpdX/Lw+E0EO8AJS/HT1vV9/fMEQbzFUDO0y9J4z6SQtjo1Spu7vRm9bh9doolEJL4W94Wt78M/COc0zTSOgowS2Z2GARz44R0EpyH4OiLXJZkvSbSvaGGKuB1eiB9cjePHDhG12hLvG5RPDW3CV+GO7umWP57jLILuR0Tc3GOlWjXKhJL4lK5Jz/qh8l9bCKEkWoEVyzFFPo4CnrD4LkS5I9xRNMcFfTys0cXPgeVaQtDEK0irTl25GiiTSDq7BivH/Iwwqj+5Ozky41wKMQh+hXOKwBErawSeCmibrOcwniIipm+66CrRTTuZ2J4tVoedkiFG5bQGj94KF/qzT/GwZwQHobHfybnJR5R3WbCP+Lz7FN7R889VcffwCBddEW4fGu8OGzyp3xjNGzAiJoSNX7lSSmfR/cMvIutJ29uParpC7T8G7ybDZWvEy7WymCRevdQecl+tnE5xHhvPlFy94U0LI9g2lCr0dcJGy4SGzoYr2tGEurE2yok8TwjnB6Pvfs+W1s7cp7j+IM7UN0rQhqJPSZaO6EQb3lq7jIjN2r4DfUGYo0cpVDllLXVTTCD1BHeRUsC58+kdy7gA+AL6+GQig0zYS6MqEZyWJ628Y4pVUPCWwMVHn5660c+ALmh0pZ9ZYHNbEd/4dUOK6c3jTTTA/dyVeOIgdxyBE1Py4My/lRWSibB27FAtQ1zmWvRgLLVrBZfhvLQJB8dPRvpxeZWIjTmRh1DTjheH3MGLB8MEhB3LbuUokko5l2Jq16wC/SOdJgNE6Qc0E6VQWsgNsWW8eq3SrDq1Ejw8neNaen6rpq+YhhVRz1uEJpQWm1cVb0QMM/bOtSkdDEoQu4Q5ZDLMP3SMtAUJ/RnL57lNWchmGwLbmFHFdyDB71BspWAWZc2VMKFfbDtAyRPsPt8auDO9XuzdsKv+nDZ5Kxn9dfOW64cDihH3U+bXNcfzJMYHwCwlptWKHAZ6JDlFRHRTK2mfGZcLXoYy8F6Y8LH3GhMjQfYXFnxkRtZ0CVzD1rBzr3xAolFTaA/7EBo2H0fp7kkcUlwo4J1j9vRE4wC+FG25U37XvHXnDIcxvyE51PTFAU1H9wZDZRufLOF+URFcMgdY/tRqy0RQedFgVbv61P/1+3fdP5jyo/YassnTjErZd4Qg6Z/5HarPjW5V3HLslJrwBgZBBi7zQxJnIfAPqBTdXWH76vHl0K2dPt7qbAIW3LxXK8G8QhfK+Z+THo1B001OEil5+DGtsv/cvhjHN0pUaQJfnrPzrbCMERDgfBD35cNo1hNbIhBMVrMXF5qHnEpr0mVlbP1jE/VDsHdZD8lRhPQAnXm1U7a7TmY69RdwNki3l/lpgM8wA7ME9wl9KqY2FbrXJNMgbrRyzaJlTopfv2uomVZiEUdbIyxosLTOxQ2zftz+RVshpZYAFuv4B2CbouPgWr2BDZ3Zs4JhvXnVzkuBKtzrzuyHZMylHTJJUKSic7LNeKnb5Dl118nCr+WqmxE/IaDznofqSHh/NZD6k3ep2d/akTyueya4WZml4weNlgm9isnT31L646MPRSirvt+Pu0523jXTcFAkyvoD3SGwbTC/A2l8h9jkPDUSVJHAwgT4com4b9FrS4nCczjp0do91v5mvcgHW0K+EcuVgFgDtSdgigX887I8oxDtSK3MX8IVl5fO8bE6n77zSSxf3wyQGOWRPxf3hNg4p05AGHl4+U70otaw7xIWLgMPXYoW8dBFZtlveBmyCAH3I5PSkeijdLsHMq/jMA2f3HiLF+U51WBxYN6JWIv6yJLiFvnD023dyFUiiJziw1wC8XZiSWdl+17mOe2La+xJhLOq4Sltc11i/6zVmHjEwRjhRbXqTq5m5ozjhkFVilRrpO7VpvpU2k6UF7bbiw8sePOSQKvV5B3uY6G8UiphS66R0U5+6iWOgykOAhFy9dyqxDiNnG0ed02kiaBogQYYIvD+1NDKAGfpxDDv24CyEj7floBhzaa/NnMJ0fMArxE9SOGydDGpl2SnOy5qBsEZ5yQOjaZu3yRXlcYWDBCl8Lq6x5uc8Q2VXevl7HUMiNrQl7dPjAISQDv3Wvgt09IuRr8/14ircZOj9SyBUmGEtV2Zb4HA4mrhyrzY9XAqIr3BkmLK2Gx/H4t8AdpJT0T+XffpWBD6spQSJIDRdbhv54BmBeBI2WuNw3LKex/8PBlZXHwWVNOawI4UbU2AnbC9lR1Pql30/buuqtV+XXRStYooUHfyGNcdg4d6JXzEFqjHAXH/GsDp3ERws5lVznEzps3Kb6Zf6Lb41339Ao/jPlqVI6TK3rAAXrB246rGR9eKPaC4QRrC8e0TkuIs08LNBCYbopS1N/EZeWv/p1hkS3I7se5FiHajaKRLINeEShIh1q+ZRAxNydff3g1DTx53fK8Sv8gh68Q1K8MQ0Nr3mZcg2HcAMYzkWI4WKYold3IlV8nxQ88rxAjfLooTUanl7UKQUtHuBqlwFWUFioSllbhhXoRwqPUdbEnO4Hg2yHgAUPeqcaPShezIPs8zeqiwSBcA/tmBn5lK4UkDjgAX7tTDNESkMggwlCcGnP4UUL4rk/SPiWVkTMLHuwPoUx5LSWxU3B+uFWSPp5aZDWaoLR1MoEqnv4KJ3p9GHyDVXLkr/hmnDCAqdLaGGwa1ZG77QzCxhrzLR+JctMw9tju4mx3snmzXJK3fzbUl1GQVAZZKXuLISiZpwgfMDPPIKsI74VmdezQ1SjrmdwFgE2sMYuu6II5ArxxbCQEGliE1HeJ2YFAwsTBuFm0TVDaELKDDPi9g5th1uZJVAwPlKWE1dI/HBdUTE2H79x/DViVCBpqCEzDIyVjsm1ANdDO6/Nr02V5BBGC5CKwxtlzVxuSttUfo8B0IVEfUmwEDqOXATl+YAlyRJ9cGFMbEW1ndYo1occ1nS+IzhHWsPBiMLnn/SPRZjpyYsxy0VRK0hF2C9b4eyvoKBdKv6irUB/8xFt4ZAZuSX06WD3BnMQDua2/6mBDCUowQPaar1BjYZ09qqvTk1/sUz2lOZ4P/H1fKZ6x2L3CCFkCauIB2Iceml9X4mlZ6WtneZ3/Gfa/Be2NT2FeOxOr+cr8pdI3VSL5V9UuF8bdS2rGg74jI6sh/HwoB/w+q/oeLd/9EKSajqLKVgV/MGmRg0kZN10VZ6+VshWS6A8ISOIkTzq9P12qum2nstem+cXs44R8OUaYsu1NwrAODHPvSTtJoIxec2PU99pnn60DZf6ZnPNz/u4E2AatvjXDnKxhYwawgw1izNHw9XPXpE+JyuUQR9hTt3Gni8RxLqNkNiAvDyA+wNqYwBYVJIPTiRyY1AAACVLtX2M4cE3QTl83GnpvrJY5VBwybAFiLXba98SkBaCQjTNUApm6rIQYioAAnF6c3opljxpwaziVHV12n1mnJ/dPGU/Rm5k4ymCqq6i2WUyGwBerqxc5CR/09p6fyP9uTE+Oe07ZUNYI1q/Du89nGMfBGklvGShvLIFzNEi4MjBlQYO1PKPgXLFZEgOQys7JKGDc3UhWEiqPc6Q5AH28KB5pem6iGngdWScN1ukJWvalRjoyX7iPOXhPcMBxY6XidwrHHClzh40Py4bQhpe0ug/rtFvV/Cm+eTFBV2/B5cD3odIhjeaXnAnLmGITJxCgLvEdEAahB3ZLpxbfZrczxrmqWIoimBgiOlAwrJTj7o1WtAZqanGO03daA9LmaO6xNNd8n6yfr6ZqbPw4bwNfnNf0MG9nFgKb0vkPLZ4RymmN5iGuDDAGHK/Gx1SEWCs4BEdCoNMr/wWf61PSU1/dJx7JSaZr3W8WUjsIc0FbetSEdwKsuCTHOfifYO2bgzjiZBlVNO3cuyEQ/cUP3eK+Rwv71dB7WcWuWysENBxKBfxGZHjMboWYH8pBkUZmozD8kLe/vdjm6apkfoZpHjmx57/PL7ZodFtfcqDjR2q/HbAToeeivTRvahmNUsbpqBL2CcdaPodxSsZpk65C2uD6n1UOEMltvmBi3RpRBPO4+3aBS16pqLlQsWgu0lmKhk8w3N/SM7d9+Q8L1D3xSCz31321ytsEq2l1dMNAfJSYMDMhTNfQ8+9AGIpE0rCVfuT4xDJ/rAZf1IQXN7CvlEGhczPRq/2wSWk2glfNzalo3XFm3/zV1FaSpGZRwfxz2hSY+1OxO0S1y+gbGP7vJj8SMu00QvtRLu0cJR8GwR4l7sjuSgwLWacv2kH27g0WFJ4o1QtaGdMTyt/j5fVrgbd5F4+eAzqCiE64Sz2gR0dg2Vj4F2lU6iDRhzXDEWBx0OPq9M77KNlSWNDiyj6eagvu1oPAn179Msqj4pzuDeXWPfBZ9zln+LJqy9k1ViIQwQ/1IOjAe9U8RwtUfNRdX6oeX6vov+0DTz35lvqclHRTWxuXoJcUTnYFqem3vidknOjdVqfh8Ze4HT3QFPo2HSXn8CPAswOAwliUUDMk0R7Faxn8EzsDPk09srKIXMdz4v3yMkaEYYbEGNVzW7EUzZIdcA3gprklb2X53ujoR4iPRuV0HopNh1+cfsxfrK/ADNp9Uk5jvRmwlq+1E8+SdvggfyQviCPJK3Fk2VyicnsUXEfCFla1ztJIz+PrMAH53qOkbgWn0l3MnjN4PyPVngqqVyv4WeT7iBMbFlm2nkkEF1F47l0U+NtIxutXrKowRvpD0dqJ96bHHF3mTftrYIjj4ZjLLd6CTiFSFv8SVZDmU5ri1UX3J0y11+kRU8q3y6w2Zjlrz+Xcp0VO1Bh6yyRL28kTLUoOrl6JP95ZRP50CSdjb7eBIVNGE5dxVO/UevGWlX1gPevfDXJfUaDJw/9/Lhc0wlVszmor0Cx6EMqQdANJ9w4qJPa66zjOORA1eTzcWbv6SS8FFafuMGOhNtnFtpnzRyWiICG5fS7bA1QL1T0y7J95rGCqm7Jtwp+V8hWnOPaZv/B7b0LzswpDOVUwq58nG4vRQX2nhAtKKY5tegCctwCFrKI5viJ9mn2iYx4By44wpTeW/NHTX7ILHVD8dNaRbyoMlgG7yLwTknR87UCb+nLimsnCCVbCUguqDOMzTk/34J6iH3yLtp/0PBMYdzPXYHdWa9djl2qbH1tPxoyfpfwXbJ+tPOyfnrd25GD1ssUPJYCfCJ5g0DygVtlFgYvc5imZf5Ps8jFeU2S+YEwjn9Dw03qHiyan5/F+A5wPTIV9CyTZxmVim1/VbyOaaLzdltF9xB+ayEoqfT2X6j1IlXuXTfupZYAzg7RjFqYKWdusWfZCCt41xSme4Otp6x7y9gE9LhhhtCaPo/+1ge1oQMQR6xRf8fnVk1idddZuNb8rjtwjtFs3GFbjoYOEhfOT0CmyGBa3BzJ9KHoWQJYps09yo3wQs0jTUIWluJM4DGfg9wdO0UP6J/cK9dgnNZF0cn9Usysv6f/wRafT5FVHi3rEZ86LJNStZHAJX5hxougqGqS0e1/Y3GYjoCWxkGKZgKmSGDPFkMjBaDEcr7KxmA+9uW5HBZ7PzNjiqFoII4Pr+tK2NX8U86cY9tmI7ZtgxIKaa8COcFO2nUTy4VF5xqTXLx+xg0bg8wFyEP9IRL7YJgN4O4PFk/u2LB4E8zr381LZFCPklpB4QQiped2SruC7GuaCfJ6PM83GQyDuE3RXE+3H1yzPrpLUkAz69LVYLjuRhWoDl+DJ2kRep+aXJK+b/vHVqPz6pMrBZnnvx+Kr8vzNn6v9BdqNG+6juuG1quvcgGMyzHlRy+VmYPEPfCOlgbqF+0MUDNotpDzSAiRROsmUmdp+rPcbKn9kCLmrRXAGx+jQAZXNR+rW72snySHkZPxfUM34rbG7TWElDusdC1c1qsFoPD1KNL1gjTs+pR6OVHOSJdizaGF+sWlkI/92/VFQ5vKx4DOArj+Aq1zvKr0AtuVRxk3T0g2G27v+Far6Kdcw8vNYvNWn0N0yoZTrwhenvbnKKvpcoT6nRDL7taq+9856K09jdfsFBrLH/Z4EwjuWxJPj+2KkvqOqJMo1kHrXJOczg8Wt+lOZ0YSOO4Ayqlz0LHS9vw43FAbhs1pQCje6pMdcWplRQaY9+Y8DItnriC1t7Jy0Q4j4VKaN7s4k/0cteF4U8BYFCU4WTjhV62QeqoFrZabCMstkB/mBWgzaNO/tX0fK3Dh/B43HPaSgyioXtyHYs3tfQLrOhcrxZKc/EV3WBS8kILIyfd2iCP3TdK6XhDJ1reeky/3H3TdxPHcbvj5BOwucPMSRYcSvn8flep3UUDvZyuesppq9HsWC2Wy2n/oCcgTp7/yFfznb5umoE4Ppch1z+VoNSFdx4wsa1aspE4nwMmlysieS+MwDuvaoBsrxQ06MDHhwfjoJ3R1lTpjBY/gZNz2vJG/PCu6xF3+nsUsmx7PpzninSz4zGSpMYjGVTp30uDCxo7HHC5ZrVKiIegxidYNQWIidITh6ByC3bQzX7d2wyp0KtdQuCpVrMqZ9NYAo2Vdcu9oEre3f7h1eBcT650ojvRW9EmJxaoO5tKjd+0+hemHVPqctCEkOiBREPVs1MjK1kkta1+1ZLux2RtZ9eZgEn+o1/rTxUwawkxXlv/6TEazof7H178lgJblQEQVH+UeQK+8Vt3Y47eYTIurJgicKuOxyiff/b4aN5pL2ZgNjANWuqmDXo6G1o4ddXEVV/pJznKajTMdoVnlHnCP9omKh/rom2KiDCyQ8MqniNpdVfAf2C7w/85Q24bpzNtrjhA/1R4KzKoHngo+UUYL2+//5hCYlKU2Ie4TPo6MLfng/4NPrinv8y/dC0MKFFiUfdyzibDbYQdcAxuRnVMMewUi5iTqigkfzRcERbpnpoyGMFOUg+iF9GLEbisEyNUh01I/ng8cgWLDhZDo9a8zwmx/LBIrf7Vacj0ldgS8l7WKedKfJoI82gmVrd7/ZxR64HzjN9Rv3rtqrXyV056il6NNkv91KrbbCoN3Fu1tmLiXeRlHWrnzwPHT0icAtTryTR5jE6fpTA9CCjc4WdnHoNWb6K90wp/uNNu1lhIAnSfHiFESLAu+Uh+TCGQAPWMWAeKDVkF/5OAM8Ts4IvQsmi1He4MXtqrTtFOrWKfROXPjmu452E3zTwPkAmNs8oAGPz9H6gXPhOMpzHqokIGOEHghERnLYyZuZdQiwQRaGmhzPiB0OQ4fiTq4owLZ8p42y/HbD6hbTcY0xHFL3EogWE17zPh7DGev2WEzQvcucsjeNr5X/QTr8ly5nT1+UfDBYV997qYitBCkaKbRhe4/oocDaNmiRyWrt5mjo5bogEASPIAKAdSfhGUmX/c9GaQhwK3etQXcHpkly77TMoDv5k0JuBKgw44YR/yCuk6g+kzyd+jDuuhPKTm9IjMSiw2Ll1BnH2Xy/xTePVJXWPpX+L0pjOvG0GznGMjGuFOPfrJLoyBNjFRZ73sM6i/6zElqsBr5+6Xj3TvHl27rhG0mqJl6JdTOvPsufXFnaprZVCPPi+Ch7ndO8lxOPxioWzOGhbgcLzdn/ZkiwnsP6DCH5BBTXsyaNc1kUi/hiSfiUMw6xWC0veXUqUXRdKFYaREvH/krN2lkJNydeGcpoRr1nMnd3v1KjFup0MmHR0JpR4QvQsFAvpwVdUX2R2MLHWJdAiQeWzHv1yhWqrXXvirU0Gihys6AlVPSn0/j4DrdNPNq56+hB7/qRMLeq+onooTCaYbX94s652xS8GqhwW9mmZTJBbhpk13F0GIT6ZfMs+jeThap6E3lTyIjbkRceP7H49zFDPXMv0sjA01hIQbEAt374AxAoeRZh3Mhhgs9szhVeNkRH58cmqIOptAORtNpIbpmoMyK8MkOajLWvOJvnePFU3yTvgt4ayLK0YaPpTH+twqukdxW75/2oNrN7cecYeBYAZVRsrpX7TF0NK9H/7+L5c8sAVrevsNSTqQOhgYI8Wcg1A9vNgdZogoMnjCou7DXRdrb8F5F526NDMmi+j6yu9kJiXnoQChcvtjXorZ2sT6KJzlbV2r1u2PKsuakcrRIex1/5iuraNHz1ao0e4Rp3J7jVWrd+4A4ZnCkswwRz9vJZaHGNzrGYSr4VxFI3gluqMKMW4EfH0K/N/QhQ8ZOiCl8i0nwYxdDXoeN5OKzF41ZbE5laLCHLTR9Au9wFVhf8O4m7C26Q6HRMfZdRYRZz59VUusMbZuNBtIUMnnik76Q8wruty1zOUEnFL0WSRHyeXAD3JDtC+iJ3Uk0Q/4WMh2GOOraMdqR93yKfpbeoBuz79IhrOwV77lMu2qqxcYtAz7z1UFgh1BVV5eVn3J5esEMRS5mbZ7SlKUd54sjJ5sWUBhMon8E5k1xEryy5DKd5XiycssvcI2MJaK2ee2l9i+6c6fdxVUwO+7QG1wam0/lWR72W9fwoFIqCTgnMOZgIxReuMWr9DgNw7Sk0g+f1yiBLI+tbRoF4I3rq2YY2kkHcUFwLR42Oawco2ue4Dz8mvBYVOJ302SnPsRYac7AeqNXlTKIDAo2A0U5c7Y9dDgEUuJ9SiUpunEeMVex5CzU2Al3q2Gp7LNGcydb1SUKeVAI+45sNTUyeZZcDuObJJqfXPTWs2DmeEfHyzjdIC63kChARwVwnBKkLaeHvlSmxIcpxXWNnHNh41tVMre1ebEAorok8ma75aEB3wIbF0yGaOtn7D5AsZmIrB9BCipgV/X65IOxZi46JEspbCu7VpS0pQx4mK2UKmZZYSvzMNp/xRaY4UczDkgrZqnAq0Pr1iwVeb6SPZoU3wWM59+sn0FIfGxZNGI2lY6XSeq5sm+YD80BFo+7o1LFzUC97YTlpiu5WNaKSxQVnXTrqXwWXEyShi5qyMCl1Q7F2CdSKy8vVmJA1MJ+qNlP0UB6Ipv8Vd4fQ1qJrVKO87L3nAl3Ws0VtPFrEBscilMI2el4JB7f/bBfjpzUN7hhCuqjqkCtTErbecbtg9MuiJK5jzXEHPWAu7C/MENJe/GGxpqx2U8x6SmnaCwxPLhfwDa28IhjfEuOgG6rkPBq65e/sXKGBAdB8gwx4G06GFcuGDWQkKded+IZeny3v7TALw+psuWZmSzXjDQFUNKcRtbARF9V4xK7eVmXpGRHPpTF+m7HLmsMWTpxV7UCVshyNLnSoTJSsiJlRgbdep6cWCAJvVZI2hTs7ybzanWmolj8n5JLx96tPvTmMfi/pxoXat6+2KUhm3ZbEJLpSFs01TwJPHJVZZFy7izHdrX6Vc28e259HUd1Ld3YmgW8XYCBl7rJL/ep2YjeSaObLofLSLci4KlxDM2kTds3S7x3Lnk6qXqJsyUYVEQ9PPh3vR/LXhtN9UbzX6UsMfmcQEVWG5gYiKE3OwN6Ong+0hjxEMM3+YCxuhWqRNlX1yHwhWL3facx5+L4z7DhJp0b3nYRs6AL1zxS6iwLBGhDfq/08YurVGPMHPpxkVpCLXx1qKj2s/E/hxIag18rw1RhN2/QBTkczOgWdbLc6ZTriP9y2aEnsvRJChsAt5wQuPLtA30cKCxt9nUPak5aNYRKrQDC76kdDxxKHGpRuXXatwX6ik1mvBCjAYOh4wO9064XBBv3rX3nAwUtpkGHHv2JtjMGi4F5l9woiWCok7rX5I62X4ekermTG0sRmNgeEMKbsMy5PApqv+raI3QppCSdR+QeysA8muf7B9S7aTdY/GRtoTIgAakbmU+HlcMKXlOZi3gkqF+FCOmfgEiPezWEdSx0tTTqgCthDJLDAEWj2jV37SFk8iP9OhO+prtat9FDARktQ1CqIFRPKNAakPA1AgDk19+MyVgL5njKgrXaei55DINIGGvJtDDQxec3ssnOlerrsPTKC+ZlKLbeSm7HzXwUpyLbSXqOrDdqKrz3s6FzDZVf821VTfWfw90dfkh5Zh/tW2Dkj3QIInhKT2Z3XkO/8UKisG/9Whhz82tTFkcuyFplwUNtCKRovr9v9JJQHetqqAES1NdGu2vuIMXv/bFjV5b+yPnvULwKl/DL+NNo6PM8AcdVhsLJPMWqamNPX5NwFMMToAoQ4Dz1e4HMLjY3FklpGrokHJH+yixsGjdOeV57hCvQWUfUMyYmcXsVgHAJUOAdTYC0wb6223SdoBwSP4CLsZa/bn3Y3xustsLg8MnSPxu5bUpXAZaW9VtykhbzWiQEMh6CiE99l3T0SOp7LR7g09jCt/dfpe4lOJJym4MPSz3uth4SBroPGnx7oyent25xYynF2u23HYoW9uv4bR765QzP/Zh3SFOE+TByALSib0U9uwpq/0D8JS+sQNMGAlrYni+Zpp3TbNwiEI0AxKZkctfQtFm4fbvejQktWkDUe9lULCFA+UtSxrnVlSKIR2r1J/v1RWcbfUGIyRYfduJ69XetIiTXn00tZT0BuU7h8QRq/6Q8fgV/Mubt4DD4xarsa292MA0AAAAAAA==';
const grain=document.createElement('canvas');grain.width=180;grain.height=270;
const gx=grain.getContext('2d');
if(gx){const pixels=gx.createImageData(grain.width,grain.height);let seed=72903;for(let i=0;i<pixels.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)|0;pixels.data[i]=90;pixels.data[i+1]=80;pixels.data[i+2]=76;pixels.data[i+3]=(seed>>>24)&7}gx.putImageData(pixels,0,0);}
function rgb(h,a){let n=parseInt(h.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
function cover(ctx,p){
 const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,p.a);grad.addColorStop(.52,'#ece9e2');grad.addColorStop(1,p.b);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 let fog=ctx.createRadialGradient(860,510,70,820,610,900);fog.addColorStop(0,rgb(p.accent,.12));fog.addColorStop(1,rgb(p.accent,0));ctx.fillStyle=fog;ctx.fillRect(0,0,W,H);
 let light=ctx.createRadialGradient(80,80,0,80,80,730);light.addColorStop(0,'#ffffffa3');light.addColorStop(1,'#ffffff00');ctx.fillStyle=light;ctx.fillRect(0,0,W,H);
 ctx.drawImage(grain,0,0,W,H);
}
function fit(ctx,text,x,y,width,initial,{color,fontFamily=font,weight=900,cap=1}={}){
 let size=initial;ctx.font=`${weight} ${size}px ${fontFamily}`;
 let measured=ctx.measureText(text).width;
 if(measured>width)size*=width/measured;
 ctx.font=`${weight} ${size}px ${fontFamily}`;ctx.fillStyle=color||'#28282b';ctx.fillText(text,x,y,width*cap);return size;
}
// Atlas stores two rows (male/female) and five life stages. Convert paper pixels to alpha
// once so portraits sit naturally over the warm party-specific paper without white rectangles.
const caches=new Map();
const customImages=new Map();
function imageOf(src){
 if(!src)return null;
 if(!customImages.has(src)){
  const im=new Image();im.crossOrigin='anonymous';
  customImages.set(src,im);im.onload=()=>posters.forEach(paint);im.onerror=()=>posters.forEach(paint);im.src=src;
 }
 const img=customImages.get(src);return img.complete&&img.naturalWidth?img:null;
}
function portraitImage(index){
 if(!atlas.complete||!atlas.naturalWidth)return null;
 if(caches.has(index))return caches.get(index);
 const c=document.createElement('canvas');c.width=230;c.height=310;const g=c.getContext('2d',{willReadFrequently:true});
 g.drawImage(atlas,(index%5)*230,Math.floor(index/5)*310,230,310,0,0,230,310);
 const d=g.getImageData(0,0,230,310);
 for(let i=0;i<d.data.length;i+=4){const r=d.data[i],gg=d.data[i+1],b=d.data[i+2];const deviation=Math.sqrt((250-r)**2+(249-gg)**2+(249-b)**2);d.data[i+3]=Math.max(0,Math.min(255,Math.round((deviation-12)*10)));}
 g.putImageData(d,0,0);caches.set(index,c);return c;
}
function drawPortrait(ctx,data,p){
 const key=ageKeys.includes(data.portraitStage)?data.portraitStage:'infant';
 const index=(data.portraitVariant==='female'?5:0)+ageKeys.indexOf(key);
 const im=imageOf(data.imageSrc)||portraitImage(index);
 if(!im)return;
 // The photo is behind the slogan, and its shoulders deliberately disappear into the nameplate.
 const box={x:335,y:160,w:735,h:1000};let ratio=Math.min(box.w/im.width,box.h/im.height)*1.05;
 const dw=im.width*ratio,dh=im.height*ratio,dx=box.x+box.w-dw,dy=box.y+box.h-dh;
 const tmp=document.createElement('canvas');tmp.width=W;tmp.height=1190;
 const t=tmp.getContext('2d');t.drawImage(im,dx,dy,dw,dh);
 const fade=t.createLinearGradient(0,690,0,1150);fade.addColorStop(0,'#000');fade.addColorStop(.6,'#000');fade.addColorStop(1,'#0000');t.globalCompositeOperation='destination-in';t.fillStyle=fade;t.fillRect(0,0,W,1190);
 ctx.save();ctx.globalAlpha=.96;ctx.drawImage(tmp,0,0);ctx.restore();
 const veil=ctx.createLinearGradient(255,0,620,0);veil.addColorStop(0,rgb(p.a,0));veil.addColorStop(.55,rgb(p.a,.18));veil.addColorStop(1,rgb(p.a,0));ctx.fillStyle=veil;ctx.fillRect(255,90,365,1030);
}
function emblem(ctx,label,p){
 ctx.save();ctx.strokeStyle=p.accent;ctx.fillStyle=p.accent;ctx.lineWidth=8;ctx.translate(64,57);
 if(label==='무소속'){
   // Independent candidates do not receive a fabricated party mark.
   ctx.font=`900 50px ${plain}`;ctx.textBaseline='alphabetic';ctx.fillText('무',0,55);ctx.restore();return;
 }
 ctx.beginPath();
 if(label==='민주혁신당'){ctx.moveTo(4,12);ctx.lineTo(62,12);ctx.lineTo(62,31);ctx.lineTo(24,31);ctx.lineTo(24,60);ctx.lineTo(4,74);ctx.closePath();ctx.fill();ctx.fillRect(37,45,48,18);}
 else if(label==='자유국민당'){ctx.moveTo(0,65);ctx.lineTo(24,37);ctx.lineTo(37,48);ctx.lineTo(68,17);ctx.lineTo(82,33);ctx.lineTo(37,82);ctx.lineTo(24,69);ctx.lineTo(12,82);ctx.closePath();ctx.fill();}
 else if(label==='진보연대'){ctx.moveTo(4,34);ctx.quadraticCurveTo(45,-3,85,34);ctx.stroke();for(let i=0;i<3;i++)ctx.fillRect(10+i*27,45,17,35);}
 else if(label==='국가수호당'){ctx.moveTo(45,5);ctx.lineTo(82,21);ctx.lineTo(79,58);ctx.quadraticCurveTo(72,76,45,88);ctx.quadraticCurveTo(18,76,10,58);ctx.lineTo(8,21);ctx.closePath();ctx.fill();}
 else{ctx.arc(33,44,31,.4*Math.PI,1.85*Math.PI);ctx.stroke();ctx.beginPath();ctx.arc(59,44,28,-.45*Math.PI,.9*Math.PI);ctx.stroke();}
 ctx.restore();
}
function header(ctx,data,p){
 const party=(data.partyName||'무소속').trim();const political=party!=='무소속';
 const label=political?party:(data.stage||'').trim();
 if(political){emblem(ctx,party,p);fit(ctx,label,162,115,710,53,{color:p.ink,fontFamily:plain});}
 else{ctx.fillStyle=p.accent;ctx.fillRect(57,66,66,6);fit(ctx,label||'인생 기록',57,139,710,58,{color:p.ink,fontFamily:plain});}
}
function slogan(ctx,data,p){
 let lines=String(data.phrase||'세상은 아직\n놀이터').split(/\n+/).map(s=>s.trim()).filter(Boolean).slice(0,4);
 if(!lines.length)lines=['세상은 아직','놀이터'];
 // Contain even legacy unbroken slogans; do not touch the portrait nameplate.
 if(lines.some(s=>s.length>8)){lines=lines.flatMap(s=>s.match(/.{1,7}/gu)||[]).slice(0,4);}
 const settings={1:{size:188,start:590,step:0},2:{size:172,start:508,step:202},3:{size:144,start:380,step:162},4:{size:119,start:318,step:136}}[lines.length];
 lines.forEach((line,i)=>{
   const x=57+(i%2?7:0),y=settings.start+i*settings.step;
   ctx.save();ctx.translate(x,y);ctx.rotate((i%2?-.008:-.024));ctx.transform(1,0,-.045,1,0,0);
   ctx.font=`900 ${settings.size}px ${font}`;
   const measured=ctx.measureText(line).width;
   ctx.scale(Math.min(1,600/Math.max(measured,1)),1);
   ctx.lineWidth=6;ctx.strokeStyle=p.ink;ctx.lineJoin='round';ctx.strokeText(line,0,0);
   ctx.fillStyle=p.ink;ctx.fillText(line,0,0);ctx.restore();
 });
}
function identity(ctx,data,p){
 const y=1137,gradient=ctx.createLinearGradient(0,1010,0,H);
 gradient.addColorStop(0,rgb(p.a,0));gradient.addColorStop(.25,rgb(p.a,.86));gradient.addColorStop(.55,rgb(p.a,.98));gradient.addColorStop(1,rgb(p.a,.98));ctx.fillStyle=gradient;ctx.fillRect(0,1010,W,490);
 ctx.fillStyle=rgb(p.ink,.18);ctx.fillRect(63,y,870,2);ctx.fillStyle=p.accent;ctx.fillRect(63,y,92,6);
 const hasNumber=data.number!==undefined&&data.number!==null&&String(data.number).trim()!=='';
 const value=hasNumber?String(data.number):String(Number.isFinite(+data.age)?data.age:0);
 const leftX=63,rightX=349,baseline=1408;
 ctx.textBaseline='alphabetic';fit(ctx,hasNumber?'기호':'나이',leftX,1203,225,27,{color:p.accent,fontFamily:plain});
 fit(ctx,(data.stage||'').trim(),rightX,1203,570,30,{color:p.accent,fontFamily:plain});
 ctx.fillStyle=rgb(p.ink,.16);ctx.fillRect(317,1209,2,214);
 fit(ctx,value,leftX,baseline,230,value.length>1?216:270,{color:p.accent});
 fit(ctx,String(data.name||'이름 미정'),rightX,baseline,570,166,{color:p.ink});
 ctx.fillStyle=p.accent;ctx.fillRect(rightX,1443,584,5);
}
function paint(el){
 const canvas=el.querySelector('canvas');if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
 const data=el._posterData||{};
 const p=palettes[data.partyName]||palettes['무소속'];
 ctx.clearRect(0,0,W,H);cover(ctx,p);drawPortrait(ctx,data,p);header(ctx,data,p);slogan(ctx,data,p);identity(ctx,data,p);
}
function update(el,data={}){
 if(!el?.classList?.contains('gk-poster'))throw new TypeError('Expected GukminPoster.create element');
 const signature=JSON.stringify([data.name,data.age,data.number,data.partyName,data.stage,data.phrase,data.portraitStage,data.portraitVariant,data.imageSrc]);
 if(el._posterSignature===signature)return el;
 el._posterSignature=signature;el._posterData={...data};el.dataset.age=data.portraitStage||'infant';
 const text=el.querySelector('.gk-poster-accessible');
 if(text)text.textContent=[data.stage,data.phrase,data.name].filter(Boolean).join(' · ');
 paint(el);return el;
}
function create(data={}){
 const el=document.createElement('article');el.className='gk-poster';el.setAttribute('aria-label','국민의 부름 인물 포스터');
 const canvas=document.createElement('canvas');canvas.className='gk-poster-canvas';canvas.width=W;canvas.height=H;canvas.setAttribute('aria-hidden','true');
 const accessible=document.createElement('span');accessible.className='gk-poster-accessible';
 const button=document.createElement('button');button.type='button';button.className='gk-poster-save';button.textContent='포스터 저장';button.setAttribute('aria-label','포스터 PNG 저장');button.addEventListener('click',e=>{e.stopPropagation();download(el)});
 el.append(canvas,accessible,button);
 if(posters.size>10)for(const previous of posters)if(!previous.isConnected)posters.delete(previous);
 posters.add(el);update(el,data);return el;
}
function download(el){
 const canvas=el?.querySelector('canvas');if(!canvas)return;
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='국민의부름_포스터.png';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)},'image/png');
}
async function ready(el){
 const jobs=[atlas.decode(),document.fonts?.ready];const custom=customImages.get(el?._posterData?.imageSrc);if(custom)jobs.push(custom.decode());
 await Promise.allSettled(jobs);paint(el);return el.querySelector('canvas');
}
global.GukminPoster=Object.freeze({create,update,download,ready});
if(document.fonts?.ready)document.fonts.ready.then(()=>posters.forEach(paint));
})(window);
