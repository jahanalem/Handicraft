using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Models;

using Jahan.Handicraft.Model.UModel.ViewModel;
using umbraco;
using Umbraco.Core;
using Umbraco.Web;


namespace Jahan.Handicraft.Model.UModel.ViewModel
{
    public class ProductRelatedLink
    {
        public int MyProperty { get; set; }
        public   RelatedLinks Link { get; set; }
        public  string Picture { get; set; }
        public  string ProductName { get; set; }
        public  List<ProductRelatedLink> Get(IPublishedContent content, CultureInfo culture)
        {
            List<ProductRelatedLink> productLinkList = new List<ProductRelatedLink>();
            List<RelatedLinks> relatedLinkList = RelatedLinks.GetProperties(content, "RelatedLinks",null);
            foreach (var rLink in relatedLinkList)
            {
                var vm = new ProductRelatedLink();
                var umbracoHelper = new Umbraco.Web.UmbracoHelper(Umbraco.Web.UmbracoContext.Current);
                IPublishedContent newContent = umbracoHelper.TypedContent(rLink.InternalLinkId);
                vm.ProductName = newContent.GetPropertyValue("ProductName").ToString();
                vm.Picture = newContent.GetPropertyValue<string>("PictureForRelatedLinks");
                vm.Link = rLink;
                productLinkList.Add(vm);
            }
            return productLinkList;
        }
    }
}
