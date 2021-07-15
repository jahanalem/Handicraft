using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Jahan.Handicraft.Model.UModel;
using Umbraco.Web.Models;

namespace Jahan.Handicraft.Web.Mvc.UmbracoCms.App.Controllers
{
    public class ProductController : BaseRenderMvcController<Product>
    {
        // GET: Product
        public override ActionResult Index(RenderModel model)
        {
            return CurrentTemplate(Instance);
            //return base.Index(Instance);
        }
    }
}
/* 
var prd = new Product
            {
                Id = 11,
                MainPicture = "/media/001.jpg",
                CreateDate = DateTime.Now,
                Description = "des",
                FirstTitle = "first",
                Price = "21",
                ProductName = "erge r",
                SecondTitle = "second",
                Icon = ""
            };
*/
